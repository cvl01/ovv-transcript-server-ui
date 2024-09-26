/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface AudioFile {
    filename?: string | null;
    id: number;
    transcript_json?: AlignedTranscriptionResult | null;
    short_summary?: string | null;
    processing_options?: {
        [k: string]: unknown;
    } | null;
    transcript_parsed?: string | null;
    transcript_corrected?: string | null;
    questions_answers?: QuestionAnswer[];
    project_id?: number | null;
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
}
export interface AudioFileBase {
    filename?: string | null;
}
export interface AudioFileCreate {
    filename?: string | null;
}
export interface AudioFileSummary {
    id: number;
    filename: string;
    processing_options?: {
        [k: string]: unknown;
    } | null;
    project_id?: number | null;
}
export interface Project {
    id: number;
    name: string;
    description?: string | null;
    audio_files?: AudioFileSummary[];
    questions_answers?: QuestionAnswer[];
}
export interface ProjectCreate {
    name: string;
    description?: string | null;
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
