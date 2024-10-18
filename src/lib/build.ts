import { ESLint } from "eslint";
import { createHash } from "node:crypto";
import zlib from "node:zlib";

import {
  makeResultFromJsonResponse,
  makeResultFromResponse,
  type Result,
} from "./server";

export type PushBuildPayload = {
  source: "cli";
  version: string;
  git: {
    provider: "github" | "unknown";
    serverUrl?: string;
    repositorySlug?: string;
    commit: {
      author: {
        name: string;
        email: string;
      };
      message: string;
      date: string;
      sha: string;
      branch: string;
    };
  };
  linter: {
    linterId: "eslint";
    version?: string;
    results?: Array<unknown>;
    rules?: ESLint.LintResultData["rulesMeta"];
  };
};

export const push = async ({
  projectToken,
  serverUrl,
  payload: uncompressedPayload,
}: {
  projectToken: string;
  serverUrl: string;
  payload: PushBuildPayload;
}) => {
  const payload = zlib.gzipSync(JSON.stringify(uncompressedPayload));

  const payloadMD5 = createHash("md5").update(payload).digest("base64");
  const payloadLength = Buffer.byteLength(payload, "utf-8");

  const {
    payload: { uploadUrl, buildId },
  } = await getS3UploadUrl({
    projectToken,
    serverUrl,
    payloadMD5,
    payloadLength,
  });

  await uploadToS3({ uploadUrl, payload, payloadMD5 });

  return triggerProcessing({ projectToken, serverUrl, buildId });
};

export const triggerProcessing = async ({
  projectToken,
  serverUrl,
  buildId,
}: {
  projectToken: string;
  serverUrl: string;
  buildId: string;
}) => {
  const response = await fetch(`${serverUrl}/api/builds/process`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Project-Token": projectToken,
    },
    body: JSON.stringify({ buildId }),
  });

  return makeResultFromJsonResponse<{ traceId: string; buildId: string }>(
    response,
    "Error while triggering build processing",
  );
};

export const getS3UploadUrl = async ({
  projectToken,
  serverUrl,
  payloadMD5,
  payloadLength,
}: {
  projectToken: string;
  serverUrl: string;
  payloadMD5: string;
  payloadLength: number;
}): Promise<Result<{ uploadUrl: string; buildId: string }>> => {
  const response = await fetch(`${serverUrl}/api/builds/upload-url`, {
    method: "get",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Build-Content-MD5": payloadMD5,
      "X-Build-Content-Length": payloadLength.toString(),
      "X-Project-Token": projectToken,
    },
  });

  return makeResultFromJsonResponse<{ uploadUrl: string; buildId: string }>(
    response,
    "Error while getting the upload URL",
  );
};

export const uploadToS3 = async ({
  uploadUrl,
  payload,
  payloadMD5,
}: {
  uploadUrl: string;
  payload: Buffer;
  payloadMD5: string;
}) => {
  const response = await fetch(uploadUrl, {
    method: "put",
    headers: {
      "Content-MD5": payloadMD5,
    },
    body: payload,
  });

  return makeResultFromResponse(
    response,
    "Error while uploading the payload to S3",
    undefined,
  );
};
