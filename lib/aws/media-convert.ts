import "server-only";

import {
  CreateJobCommand,
  MediaConvertClient,
  type CreateJobCommandInput,
} from "@aws-sdk/client-mediaconvert";
import { getS3RuntimeConfig } from "@/lib/aws/s3-client";

export type WebVideoTranscode = {
  inputKey: string;
  outputKey: string;
  jobId: string;
};

let client: MediaConvertClient | null = null;

function getClient(): MediaConvertClient | null {
  const config = getS3RuntimeConfig();
  if (!config) return null;
  if (!client) {
    client = new MediaConvertClient({
      region: config.region,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }
  return client;
}

function getMediaConvertRoleArn(): string | null {
  return process.env.AWS_MEDIACONVERT_ROLE_ARN ?? null;
}

function getOutputKey(inputKey: string): string {
  const slash = inputKey.lastIndexOf("/");
  const dir = slash >= 0 ? inputKey.slice(0, slash + 1) : "";
  const file = slash >= 0 ? inputKey.slice(slash + 1) : inputKey;
  const dot = file.lastIndexOf(".");
  const base = dot > 0 ? file.slice(0, dot) : file;
  return `${dir}web/${base}_web.mp4`;
}

/** Submit an asynchronous MP4/H.264/AAC transcode for reliable browser playback. */
export async function submitWebCompatibleTranscode(inputKey: string): Promise<WebVideoTranscode | null> {
  const config = getS3RuntimeConfig();
  const roleArn = getMediaConvertRoleArn();
  const mediaConvert = getClient();
  if (!config || !roleArn || !mediaConvert) return null;

  const slash = inputKey.lastIndexOf("/");
  const dir = slash >= 0 ? inputKey.slice(0, slash + 1) : "";
  const file = slash >= 0 ? inputKey.slice(slash + 1) : inputKey;
  const dot = file.lastIndexOf(".");
  const base = dot > 0 ? file.slice(0, dot) : file;
  const outputKey = `${dir}web/${base}_web.mp4`;
  const outputPrefix = outputKey.slice(0, outputKey.lastIndexOf("/") + 1);

  const settings: CreateJobCommandInput["Settings"] = {
    OutputGroups: [{
      Name: "Browser Compatible MP4",
      OutputGroupSettings: {
        Type: "FILE_GROUP_SETTINGS",
        FileGroupSettings: { Destination: `s3://${config.bucket}/${outputPrefix}` },
      },
      Outputs: [{
        NameModifier: "_web",
        Extension: "mp4",
        VideoDescription: {
          CodecSettings: {
            Codec: "H_264",
            H264Settings: {
              RateControlMode: "QVBR",
              QvbrSettings: { QvbrQualityLevel: 7 },
              MaxBitrate: 12000000,
              CodecProfile: "MAIN",
              CodecLevel: "AUTO",
              FramerateControl: "INITIALIZE_FROM_SOURCE",
              GopSize: 2,
              GopSizeUnits: "SECONDS",
              NumberReferenceFrames: 3,
              EntropyEncoding: "CABAC",
              AdaptiveQuantization: "HIGH",
              SpatialAdaptiveQuantization: "ENABLED",
              TemporalAdaptiveQuantization: "ENABLED",
              SceneChangeDetect: "TRANSITION_DETECTION",
            },
          },
        },
        AudioDescriptions: [{
          AudioSourceName: "Audio Selector 1",
          CodecSettings: {
            Codec: "AAC",
            AacSettings: { Bitrate: 128000, CodingMode: "CODING_MODE_2_0", SampleRate: 48000, CodecProfile: "LC", RateControlMode: "CBR" },
          },
        }],
        ContainerSettings: { Container: "MP4", Mp4Settings: { MoovPlacement: "PROGRESSIVE_DOWNLOAD" } },
      }],
    }],
    Inputs: [{
      FileInput: `s3://${config.bucket}/${inputKey}`,
      AudioSelectors: { "Audio Selector 1": { DefaultSelection: "DEFAULT" } },
      VideoSelector: { ColorSpace: "FOLLOW" },
      TimecodeSource: "ZEROBASED",
    }],
  };

  const response = await mediaConvert.send(new CreateJobCommand({
    Role: roleArn,
    Settings: settings,
    StatusUpdateInterval: "SECONDS_60",
    UserMetadata: { sourceKey: inputKey, outputKey },
  }));

  if (!response.Job?.Id) throw new Error("MediaConvert did not return a job ID.");
  return { inputKey, outputKey, jobId: response.Job.Id };
}

export function getWebVideoOutputKey(inputKey: string): string {
  return getOutputKey(inputKey);
}