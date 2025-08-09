import { createMemory } from "../memories/services";
import type {
	FetchAndStoreLlmsTxtInput,
	QueryLlmsTxtInput,
} from "./validators";

function normalizeUrl(website: string): string {
	let url = website.trim();
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = `https://${url}`;
	}
	return `${url.replace(/\/$/, "")}/llms.txt`;
}

async function fetchLlmsTxtContent(url: string): Promise<string> {
	const response = await fetch(url, {
		headers: {
			"User-Agent": "Supercontext API/1.0",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch llms.txt from ${url}: ${response.status} ${response.statusText}`,
		);
	}

	const content = await response.text();

	if (!content.trim()) {
		throw new Error(`The llms.txt file at ${url} is empty`);
	}

	return content;
}

function parseLlmsTxtSections(
	content: string,
): Array<{ title: string; content: string }> {
	const lines = content.split("\n");
	const sections: Array<{ title: string; content: string }> = [];
	let currentSection = "";
	let currentContent = "";

	for (const line of lines) {
		const trimmedLine = line.trim();

		if (
			trimmedLine.match(/^#+\s+/) ||
			(trimmedLine.length > 0 &&
				trimmedLine === trimmedLine.toUpperCase() &&
				trimmedLine.length < 100)
		) {
			if (currentSection && currentContent.trim()) {
				sections.push({
					title: currentSection,
					content: currentContent.trim(),
				});
			}

			currentSection = trimmedLine.replace(/^#+\s+/, "");
			currentContent = "";
		} else if (trimmedLine) {
			currentContent += `${line}\n`;
		}
	}

	if (currentSection && currentContent.trim()) {
		sections.push({
			title: currentSection,
			content: currentContent.trim(),
		});
	}

	return sections;
}

export async function queryLlmsTxtContent({
	website,
	question,
	createMemories,
	spaceIds,
	userId,
	apiKeyId,
}: QueryLlmsTxtInput & { userId: string; apiKeyId?: string }) {
	const url = normalizeUrl(website);
	const llmsContent = await fetchLlmsTxtContent(url);
	const memoriesCreated: string[] = [];

	if (createMemories) {
		const fetchedAt = new Date().toISOString();
		const baseMetadata = {
			source: "llms.txt",
			website,
			url,
			fetchedAt,
			question,
			type: "website_documentation",
		};

		await createMemory({
			content: `llms.txt content from ${website}:\n\n${llmsContent}`,
			spaceIds,
			metadata: {
				...baseMetadata,
				contentType: "full_document",
			},
			userId,
			apiKeyId,
		});
		memoriesCreated.push("Full llms.txt content");

		const sections = parseLlmsTxtSections(llmsContent);
		for (let i = 0; i < Math.min(sections.length, 5); i++) {
			const section = sections[i];
			if (section) {
				try {
					await createMemory({
						content: `Key information from ${website} (${section.title}):\n\n${section.content}`,
						spaceIds,
						metadata: {
							...baseMetadata,
							contentType: "section",
							sectionTitle: section.title,
							sectionNumber: i + 1,
						},
						userId,
						apiKeyId,
					});
					memoriesCreated.push(`Section: ${section.title}`);
				} catch (error) {
					console.warn(
						`Failed to create memory for section "${section.title}":`,
						error,
					);
				}
			}
		}

		const summaryContent = `Summary of ${website} based on llms.txt:

Website: ${website}
Fetched: ${fetchedAt}
Question asked: ${question}

Key observations:
- Content length: ${llmsContent.length} characters
- Number of sections identified: ${sections.length}
- This information was fetched to answer: ${question}

The full content and detailed sections have been stored as separate memories for future reference.`;

		await createMemory({
			content: summaryContent,
			spaceIds,
			metadata: {
				...baseMetadata,
				contentType: "summary",
				sectionsCount: sections.length,
				contentLength: llmsContent.length,
			},
			userId,
			apiKeyId,
		});
		memoriesCreated.push("Summary and observations");
	}

	return {
		website,
		llms_txt_url: url,
		question,
		llms_txt_content: llmsContent,
		memories_created: createMemories ? memoriesCreated : [],
		answer: `Based on the llms.txt content from ${website}, here's the answer to your question: "${question}"\n\nContent from llms.txt:\n${llmsContent}\n\nTo answer your specific question, please analyze the above content in the context of: ${question}${
			createMemories && memoriesCreated.length > 0
				? `\n\nNote: I've created ${memoriesCreated.length} memories from this content: ${memoriesCreated.join(", ")}. You can search for this information later using the search_memory tool.`
				: ""
		}`,
	};
}

export async function fetchAndStoreLlmsTxtContent({
	website,
	spaceIds,
	customTags,
	userId,
	apiKeyId,
}: FetchAndStoreLlmsTxtInput & { userId: string; apiKeyId?: string }) {
	const url = normalizeUrl(website);
	const llmsContent = await fetchLlmsTxtContent(url);
	const memoriesCreated: string[] = [];
	const fetchedAt = new Date().toISOString();

	const baseMetadata = {
		source: "llms.txt",
		website,
		url,
		fetchedAt,
		tags: customTags,
		type: "website_documentation",
	};

	await createMemory({
		content: `Complete llms.txt documentation from ${website}:\n\n${llmsContent}`,
		spaceIds,
		metadata: {
			...baseMetadata,
			contentType: "full_document",
		},
		userId,
		apiKeyId,
	});
	memoriesCreated.push("Complete documentation");

	const sections = parseLlmsTxtSections(llmsContent);
	for (const section of sections) {
		try {
			await createMemory({
				content: `${website} - ${section.title}:\n\n${section.content}`,
				spaceIds,
				metadata: {
					...baseMetadata,
					contentType: "section",
					sectionTitle: section.title,
				},
				userId,
				apiKeyId,
			});
			memoriesCreated.push(`Section: ${section.title}`);
		} catch (error) {
			console.warn(
				`Failed to create memory for section "${section.title}":`,
				error,
			);
		}
	}

	const wordCount = llmsContent.split(/\s+/).length;
	const summaryContent = `Website Documentation Summary: ${website}

Source: ${url}
Fetched: ${fetchedAt}
Content Length: ${llmsContent.length} characters, ~${wordCount} words
Sections Identified: ${memoriesCreated.length - 1}
Custom Tags: ${customTags.join(", ") || "None"}

This website's llms.txt file has been processed and stored as ${memoriesCreated.length} separate memories for easy retrieval and reference.

Key sections stored: ${memoriesCreated.slice(1).join(", ")}`;

	await createMemory({
		content: summaryContent,
		spaceIds,
		metadata: {
			...baseMetadata,
			contentType: "summary",
			wordCount,
			sectionsCount: memoriesCreated.length - 1,
		},
		userId,
		apiKeyId,
	});
	memoriesCreated.push("Summary");

	return {
		success: true,
		website,
		llms_txt_url: url,
		content_length: llmsContent.length,
		word_count: wordCount,
		memories_created: memoriesCreated,
		spaces_used: spaceIds.length > 0 ? spaceIds : ["default"],
		custom_tags: customTags,
		fetched_at: fetchedAt,
		message: `Successfully fetched and stored llms.txt content from ${website}. Created ${memoriesCreated.length} memories that can be searched using the search_memory tool.`,
	};
}
