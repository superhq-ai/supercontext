import { z } from "zod";

export const checkInviteTokenValidator = z.object({
	inviteToken: z.string(),
});

export const validateTokenValidator = z.object({});
