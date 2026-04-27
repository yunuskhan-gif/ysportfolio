import type { ApiResponse, UserProfileResponse } from "./profile.types";

export interface MentorRequest {
  menteeUserId: string;
  mentorUserId: string;
  segment: string;
}

export interface MentorRequestData {
  menteeProfile: UserProfileResponse;
  mentorProfile: UserProfileResponse;
}

export interface MentorAcceptData {
  menteeProfile: UserProfileResponse;
  mentorProfile: UserProfileResponse;
}

export interface MentorRejectData {
  menteeProfile: UserProfileResponse;
  mentorProfile: UserProfileResponse;
}

export type MentorRequestResponse = ApiResponse<MentorRequestData>;
export type MentorAcceptResponse = ApiResponse<MentorAcceptData>;
export type MentorRejectResponse = ApiResponse<MentorRejectData>;