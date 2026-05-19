import { Editor, MarkdownView, Plugin } from 'obsidian';


function getCurrentLine(editor: Editor, view: MarkdownView) {
	const lineNumber = editor.getCursor().line
	const lineText = editor.getLine(lineNumber)
	return lineText
}

function prepareTask(line: string) {
	line = line.trim()
	//remove all leading non-alphanumeric characters
	line = line.replace(/^\W+|\W+$/, '')
	line = urlEncode(line)
	return line
}



function urlEncode(line: string) {
	line = encodeURIComponent(line)
	return line
}

function getThingsNoteLink(fileUrl: string) {
	try {
		const parsedUrl = new URL(fileUrl)
		const filePath = parsedUrl.searchParams.get('file')
		if (filePath == null) {
			return fileUrl
		}

		const segments = filePath.split('/').filter(Boolean)
		const fileName = segments.length > 0 ? segments[segments.length - 1] : filePath
		return `obsidian://open?file=${encodeURIComponent(fileName)}`
	} catch {
		return fileUrl
	}
}

function upsertYamlUrl(editor: Editor, thingsDeepLink: string) {
	const fileText = editor.getValue()
	const lines = fileText.split('\n')
	const urlLine = `url: ${thingsDeepLink}`

	if (lines[0] === '---') {
		const closingIndex = lines.findIndex((line, index) => index > 0 && line === '---')
		if (closingIndex !== -1) {
			const frontmatter = lines.slice(1, closingIndex)
			const urlIndex = frontmatter.findIndex((line) => /^url\s*:/.test(line))
			if (urlIndex !== -1) {
				frontmatter[urlIndex] = urlLine
			} else {
				frontmatter.push(urlLine)
			}

			const updatedText = ['---', ...frontmatter, '---', ...lines.slice(closingIndex + 1)].join('\n')
			editor.setValue(updatedText)
			return
		}
	}

	const frontmatterBlock = ['---', urlLine, '---', ''].join('\n')
	editor.setValue(frontmatterBlock + fileText)
}


function createProject(title: string, deepLink: string) {
	const project = `things:///add-project?title=${title}&notes=${deepLink}&x-success=obsidian://project-id`
	window.open(project);
}

function createTask(line: string, deepLink: string) {
	const task = `things:///add?title=${line}&notes=${deepLink}&x-success=obsidian://task-id`
	window.open(task);
}


export default class ThingsLink extends Plugin {

	async onload() {

		this.registerObsidianProtocolHandler("project-id", async (id) => {
			const projectID = id['x-things-id'];
			const workspace = this.app.workspace;
			const view = workspace.getActiveViewOfType(MarkdownView);
			if (view == null) {
				return;
			} else {
				const editor = view.editor
				const thingsDeepLink = `things:///show?id=${projectID}`;
				upsertYamlUrl(editor, thingsDeepLink)
			}
		});
		
		this.addCommand({
			id: 'create-things-project',
			name: 'Create Things Project',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const workspace = this.app.workspace;
				const fileTitle = workspace.getActiveFile()
				if (fileTitle == null) {
					return;
				} else {
					let fileName = urlEncode(fileTitle.name)
					fileName = fileName.replace(/\.md$/, '')
					const obsidianDeepLink = (this.app as any).getObsidianUrl(fileTitle)
					const thingsNoteLink = getThingsNoteLink(obsidianDeepLink)
					const encodedLink = urlEncode(thingsNoteLink)
					createProject(fileName, encodedLink);
				}
			}
		});

		this.registerObsidianProtocolHandler("task-id", async (id) => {
			const taskID = id['x-things-id'];
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view == null) {
				return;
			} else {
				const editor = view.editor
				const thingsDeepLink = `things:///show?id=${taskID}`
				upsertYamlUrl(editor, thingsDeepLink)
			}
		});
	
		
		this.addCommand({
			id: 'create-things-task',
			name: 'Create Things Task',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const workspace = this.app.workspace;
				const fileTitle = workspace.getActiveFile()
				if (fileTitle == null) {
					return;
				} else {
					let fileName = urlEncode(fileTitle.name)
					fileName = fileName.replace(/\.md$/, '')
					const obsidianDeepLink = (this.app as any).getObsidianUrl(fileTitle)
					const thingsNoteLink = getThingsNoteLink(obsidianDeepLink)
					const encodedLink = urlEncode(thingsNoteLink)
					const line = getCurrentLine(editor, view)
					const task = prepareTask(line)
					createTask(task, encodedLink)
				}
			}
		});
	}
	onunload() {

	}

	
}
