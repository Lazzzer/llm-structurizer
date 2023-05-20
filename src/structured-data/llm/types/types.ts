export type Model = {
  name: string;
  apiKey?: string;
};

export type DebugReport = {
  chainCallCount: number;
  llmCallCount: number;
  chains: ChainCall[];
  llms: LlmCall[];
};

export type ChainCall = {
  chainName: string;
  runId: string;
  start: {
    inputs: any;
  };
  end: {
    outputs: any;
  };
  error: {
    err: any;
  };
};

export type LlmCall = {
  llmName: string;
  parentRunId?: string;
  runId: string;
  start: {
    prompts: any;
  };
  end: {
    outputs: any;
  };
  error: {
    err: any;
  };
};
