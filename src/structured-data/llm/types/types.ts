export type Model = {
  name: string;
  apiKey?: string;
};

export interface DebugReport {
  chainCallCount: number;
  llmCallCount: number;
  chains: ChainCall[];
  llms: LlmCall[];
}

export interface ChainCall {
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
}

export interface LlmCall {
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
}
