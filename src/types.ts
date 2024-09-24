/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface AudioFile {
  filename: string;
  id: number;
  transcript_json?: AlignedTranscriptionResult | null;
  short_summary?: string | null;
  processing_options?: {
    [k: string]: unknown;
  } | null;
  transcript_parsed?: string | null;
  transcript_corrected?: string | null;
  questions_answers?: QuestionAnswer[];
}
/**
 * A list of segments and word segments of a speech.
 */
export interface AlignedTranscriptionResult {
  segments: {
    [k: string]: unknown;
  }[];
  language: string | null;
  word_segments: {
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
export interface QuestionAnswer {
  question_id: string;
  heading: string;
  question: string;
  answer: string;
  id: number;
  audio_file_id: number;
}
export interface AudioFileBase {
  filename: string;
}
export interface AudioFileCreate {
  filename: string;
}
export interface AudioFileSummary {
  id: number;
  filename: string;
  processing_options?: {
    [k: string]: unknown;
  } | null;
}
export interface QuestionAnswerBase {
  question_id: string;
  heading: string;
  question: string;
  answer: string;
}
export interface QuestionAnswerCreate {
  question_id: string;
  heading: string;
  question: string;
  answer: string;
}
