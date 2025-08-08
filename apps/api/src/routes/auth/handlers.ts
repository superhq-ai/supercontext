import { and, eq, gt } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { checkInviteTokenValidator } from "./validators";

export async function handleCheckInviteToken(c: Context) {
	const body = await c.req.json();
	const parse = checkInviteTokenValidator.safeParse(body);

	if (!parse.success) {
		return c.json({ error: "Invalid input", details: parse.error.errors }, 400);
	}

	const { inviteToken } = parse.data;
	const invite = await db
		.select()
		.from(schema.invite)
		.where(
			and(
				eq(schema.invite.token, inviteToken),
				gt(schema.invite.expiresAt, new Date()),
			),
		)
		.limit(1);

	if (!invite || invite.length === 0) {
		throw new HTTPException(400, {
			message: "Invite token is invalid or has expired.",
		});
	}

	if (invite[0]?.status === "used") {
		throw new HTTPException(400, {
			message: "Invite token has already been used.",
		});
	}

	return c.json({
		status: "success",
		message: "Invite token is valid.",
		email: invite[0]?.email,
		role: invite[0]?.role,
	});
}
