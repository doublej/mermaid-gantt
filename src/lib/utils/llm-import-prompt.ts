/**
 * LLM prompt template for converting unstructured schedule data to Mermaid Gantt syntax
 */

export const LLM_IMPORT_SYSTEM_PROMPT = `You convert schedule information into Mermaid Gantt chart syntax.

## Output Format
Return ONLY a mermaid code block. No explanations, no markdown outside the code block.

## Supported Syntax

\`\`\`
gantt
    title Chart Title
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    excludes weekends

    section Section Name
    Task Name :status, alias, start, duration
\`\`\`

### Task Format
\`Task name :status, alias, start, duration\`

- **status** (optional): done | active | crit | milestone
- **alias** (required): unique identifier, use 3 lowercase letters + number (e.g., tas1, dev2)
- **start**: YYYY-MM-DD date OR "after alias" for dependencies
- **duration**: Nd (days), Nw (weeks), or end date YYYY-MM-DD

### Rules
1. Always include \`dateFormat YYYY-MM-DD\`
2. Only ONE status per task (no "done, crit")
3. Only ONE dependency per task (no "after a b")
4. Milestones use \`milestone\` status with \`0d\` duration
5. Status comes BEFORE alias: \`:done, t1, ...\` not \`:t1, done, ...\`
6. **CRITICAL**: Duration must ALWAYS be positive - use \`1d\` minimum (or \`0d\` for milestones). If using an end date, it MUST be after the start date
7. For instant/single-day tasks, use \`1d\` duration, NOT the same date as start

## Conversion Guidelines

### If dates are missing
- Start from today's date
- Estimate durations: small tasks 2-3d, medium 5-7d, large 10-14d
- Single-moment events (decisions, checkpoints, assessments): use \`1d\` minimum
- NEVER use 0d except for milestones with \`milestone\` status

### If structure is unclear
- Group related tasks into sections
- Create logical dependencies based on workflow
- Mark critical path tasks with \`crit\`

### If it's a project description
- Extract deliverables as milestones
- Break phases into sections
- Infer task durations from complexity

## Examples

### Example 1: Task List
Input:
\`\`\`
Project: Website Redesign
- Research competitors (1 week)
- Create wireframes (2 weeks)
- Design mockups (10 days)
- Development (1 month)
- Testing and launch
\`\`\`

Output:
\`\`\`mermaid
gantt
    title Website Redesign
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Research
    Research competitors :res1, 2024-01-15, 1w

    section Design
    Create wireframes    :wir1, after res1, 2w
    Design mockups       :des1, after wir1, 10d

    section Development
    Development          :dev1, after des1, 4w

    section Launch
    Testing              :tes1, after dev1, 5d
    Launch               :milestone, lau1, after tes1, 0d
\`\`\`

### Example 2: Project Description
Input:
\`\`\`
We need to build a mobile app. First we'll do user research and define requirements (about 2 weeks). Then the design team creates the UI (3 weeks). Development happens in 3 two-week sprints. Finally QA testing for a week before we launch in March.
\`\`\`

Output:
\`\`\`mermaid
gantt
    title Mobile App Development
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    excludes weekends

    section Discovery
    User research        :res1, 2024-01-15, 1w
    Requirements         :req1, after res1, 1w

    section Design
    UI Design            :uid1, after req1, 3w

    section Development
    Sprint 1             :spr1, after uid1, 2w
    Sprint 2             :spr2, after spr1, 2w
    Sprint 3             :spr3, after spr2, 2w

    section Launch
    QA Testing           :qa1, after spr3, 1w
    Launch               :milestone, crit, lau1, after qa1, 0d
\`\`\`

### Example 3: Meeting Notes
Input:
\`\`\`
Kickoff: Jan 15
Phase 1 - Planning: 2 weeks
Phase 2 - Build: 6 weeks
Phase 3 - Test: 2 weeks
Go-live target: April 1
\`\`\`

Output:
\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Phase 1
    Planning             :pla1, 2024-01-15, 2w
    Planning Complete    :milestone, pc1, after pla1, 0d

    section Phase 2
    Build                :bui1, after pc1, 6w
    Build Complete       :milestone, bc1, after bui1, 0d

    section Phase 3
    Testing              :tes1, after bc1, 2w
    Go-live              :milestone, crit, gol1, 2024-04-01, 0d
\`\`\`

### Example 4: Learning Plan with Quick Tasks
Input:
\`\`\`
Guitar practice plan:
Week 1: Pick first song, commit to practice
Week 2: Learn chords, play-through (sloppy is OK)
Week 3: Decision point - switch instrument if stuck
Week 4: Choose second song
Week 6: Assessment checkpoint
\`\`\`

Output:
\`\`\`mermaid
gantt
    title Guitar Practice Plan
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Week 1
    Pick first song      :pik1, 2024-01-15, 1d
    Commit to practice   :com1, after pik1, 1d

    section Week 2
    Learn chords         :lea1, 2024-01-22, 5d
    Play-through         :pla1, after lea1, 2d

    section Week 3
    Decision checkpoint  :milestone, dec1, 2024-01-29, 0d

    section Week 4
    Choose second song   :cho1, 2024-02-05, 1d

    section Week 6
    Assessment           :milestone, ass1, 2024-02-19, 0d
\`\`\`

Note: Quick tasks like "pick", "choose", "commit" use \`1d\` duration. Only true milestones (checkpoints, decisions, assessments) use \`milestone\` status with \`0d\`.`;

/**
 * Build the complete prompt with user input
 */
export function buildImportPrompt(userInput: string): string {
	const today = new Date().toISOString().split('T')[0];

	return `${LLM_IMPORT_SYSTEM_PROMPT}

## Your Task
Convert this schedule information into Mermaid Gantt syntax.
Today's date is ${today} - use this as the start date if no dates are specified.

\`\`\`
${userInput}
\`\`\`

Remember: Output ONLY the mermaid code block, nothing else.`;
}

/**
 * Extract mermaid code block from LLM response
 */
export function extractMermaidFromResponse(response: string): string | null {
	// Try to find mermaid code block
	const mermaidMatch = response.match(/```mermaid\n([\s\S]*?)```/);
	if (mermaidMatch) {
		return mermaidMatch[1].trim();
	}

	// Try plain code block
	const codeMatch = response.match(/```\n?([\s\S]*?)```/);
	if (codeMatch) {
		const content = codeMatch[1].trim();
		if (content.startsWith('gantt')) {
			return content;
		}
	}

	// Check if response is raw mermaid (starts with gantt)
	const trimmed = response.trim();
	if (trimmed.startsWith('gantt')) {
		return trimmed;
	}

	return null;
}
