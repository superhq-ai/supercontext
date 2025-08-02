import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	vector,
} from "drizzle-orm/pg-core";
import { EMBEDDING_DIMENSIONS } from "@/constants";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const apiKeyStatusEnum = pgEnum("api_key_status", ["active", "revoked"]);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	role: roleEnum("role").default("user").notNull(),
	active: boolean("active")
		.$defaultFn(() => true)
		.notNull(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// Spaces table
export const space = pgTable("space", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
});

// User-Space relationship (many-to-many)
export const userSpace = pgTable("user_space", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	spaceId: text("space_id")
		.notNull()
		.references(() => space.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
});

// API Keys table
export const apiKey = pgTable("api_key", {
	id: text("id").primaryKey(),
	key: text("key").notNull().unique(),
	name: text("name").notNull(),
	status: apiKeyStatusEnum("status").default("active").notNull(),
	spaceId: text("space_id")
		.notNull()
		.references(() => space.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	lastUsedAt: timestamp("last_used_at"),
});

// Memory table
export const memory = pgTable(
	"memory",
	{
		id: text("id").primaryKey(),
		content: text("content").notNull(),
		embedding: vector("embedding", {
			dimensions: EMBEDDING_DIMENSIONS,
		}).notNull(),
		metadata: jsonb("metadata"),
		spaceId: text("space_id")
			.notNull()
			.references(() => space.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		apiKeyId: text("api_key_id").references(() => apiKey.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(table) => ({
		memoryEmbeddingIndex: index("memoryEmbeddingIndex").using(
			"hnsw",
			table.embedding.op("vector_cosine_ops"),
		),
	}),
);

// Relations for better query support
export const spaceRelations = relations(space, ({ many }) => ({
	userSpaces: many(userSpace),
	memories: many(memory),
	apiKeys: many(apiKey),
}));

export const userRelations = relations(user, ({ many }) => ({
	userSpaces: many(userSpace),
	memories: many(memory),
	apiKeys: many(apiKey),
}));

export const userSpaceRelations = relations(userSpace, ({ one }) => ({
	user: one(user, {
		fields: [userSpace.userId],
		references: [user.id],
	}),
	space: one(space, {
		fields: [userSpace.spaceId],
		references: [space.id],
	}),
}));

export const apiKeyRelations = relations(apiKey, ({ one, many }) => ({
	user: one(user, {
		fields: [apiKey.userId],
		references: [user.id],
	}),
	space: one(space, {
		fields: [apiKey.spaceId],
		references: [space.id],
	}),
	memories: many(memory),
}));

export const memoryRelations = relations(memory, ({ one }) => ({
	user: one(user, {
		fields: [memory.userId],
		references: [user.id],
	}),
	space: one(space, {
		fields: [memory.spaceId],
		references: [space.id],
	}),
	apiKey: one(apiKey, {
		fields: [memory.apiKeyId],
		references: [apiKey.id],
	}),
}));
