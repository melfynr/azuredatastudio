/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';
import * as Is from 'is';
import * as gulp from 'gulp';
import * as glob from 'glob';
import rename = require('gulp-rename');
import * as es from 'event-stream';

import { through, ThroughStream } from 'event-stream';
import * as File from 'vinyl';
import i18n = require('./i18n');
import ext = require('./extensions');

interface Map<V> {
	[key: string]: V;
}

interface ParsedXLF {
	messages: Map<string>;
	originalFilePath: string;
	language: string;
}

interface I18nPack {
	version: string;
	contents: {
		[path: string]: Map<string>;
	};
}

const extensionsProject: string = 'extensions';
const i18nPackVersion = '1.0.0';
const root = path.dirname(path.dirname(__dirname));

function createI18nFile(originalFilePath: string, messages: any): File {
	let result = Object.create(null);
	result[''] = [
		'--------------------------------------------------------------------------------------------',
		'Copyright (c) Microsoft Corporation. All rights reserved.',
		'Licensed under the Source EULA. See License.txt in the project root for license information.',
		'--------------------------------------------------------------------------------------------',
		'Do not edit this file. It is machine generated.'
	];
	for (let key of Object.keys(messages)) {
		result[key] = messages[key];
	}

	let content = JSON.stringify(result, null, '\t');
	if (process.platform === 'win32') {
		content = content.replace(/\n/g, '\r\n');
	}
	return new File({
		path: path.join(originalFilePath + '.i18n.json'),
		contents: Buffer.from(content, 'utf8')
	});
}

function updateMainI18nFile(existingTranslationFilePath: string, originalFilePath: string, messages: any): File {
	let currFilePath = path.join(existingTranslationFilePath + '.i18n.json');
	let currentContent = fs.readFileSync(currFilePath);
	let currentContentObject = JSON.parse(currentContent.toString());
	let result = Object.create(null);
	messages.contents = { ...currentContentObject.contents, ...messages.contents };
	result[''] = [
		'--------------------------------------------------------------------------------------------',
		'Copyright (c) Microsoft Corporation. All rights reserved.',
		'Licensed under the Source EULA. See License.txt in the project root for license information.',
		'--------------------------------------------------------------------------------------------',
		'Do not edit this file. It is machine generated.'
	];
	for (let key of Object.keys(messages)) {
		result[key] = messages[key];
	}
	let content = JSON.stringify(result, null, '\t');

	if (process.platform === 'win32') {
		content = content.replace(/\n/g, '\r\n');
	}
	return new File({
		path: path.join(originalFilePath + '.i18n.json'),

		contents: Buffer.from(content, 'utf8'),
	})
}

export function modifyI18nPackFiles(existingTranslationFolder: string, adsExtensions: Map<string>, resultingTranslationPaths: i18n.TranslationPath[], pseudo = false): NodeJS.ReadWriteStream {
	let parsePromises: Promise<ParsedXLF[]>[] = [];
	let mainPack: I18nPack = { version: i18nPackVersion, contents: {} };
	let extensionsPacks: Map<I18nPack> = {};
	let errors: any[] = [];
	return through(function (this: ThroughStream, xlf: File) {
		let project = path.basename(path.dirname(xlf.relative));
		let resource = path.basename(xlf.relative, '.xlf');
		let contents = xlf.contents.toString();
		let parsePromise = pseudo ? i18n.XLF.parsePseudo(contents) : i18n.XLF.parse(contents);
		parsePromises.push(parsePromise);
		parsePromise.then(
			resolvedFiles => {
				resolvedFiles.forEach(file => {
					const path = file.originalFilePath;
					const firstSlash = path.indexOf('/');

					if (project === extensionsProject) {
						let extPack = extensionsPacks[resource];
						if (!extPack) {
							extPack = extensionsPacks[resource] = { version: i18nPackVersion, contents: {} };
						}
						const adsId = adsExtensions[resource];
						if (adsId) { // internal ADS extension: remove 'extensions/extensionId/' segnent
							const secondSlash = path.indexOf('/', firstSlash + 1);
							extPack.contents[path.substr(secondSlash + 1)] = file.messages;
						} else {
							extPack.contents[path] = file.messages;
						}
					} else {
						mainPack.contents[path.substr(firstSlash + 1)] = file.messages;
					}
				});
			}
		).catch(reason => {
			errors.push(reason);
		});
	}, function () {
		Promise.all(parsePromises)
			.then(() => {
				if (errors.length > 0) {
					throw errors;
				}
				const translatedMainFile = updateMainI18nFile(existingTranslationFolder + '\\main', './main', mainPack);

				this.queue(translatedMainFile);
				for (let extension in extensionsPacks) {
					console.log('extension is ' + extension);
					const translatedExtFile = createI18nFile(`extensions/${extension}`, extensionsPacks[extension]);
					this.queue(translatedExtFile);

					const adsExtensionId = adsExtensions[extension];
					if (adsExtensionId) {
						resultingTranslationPaths.push({ id: adsExtensionId, resourceName: `extensions/${extension}.i18n.json` });
					} else {
						resultingTranslationPaths.push({ id: `vscode.${extension}`, resourceName: `extensions/${extension}.i18n.json` });
					}

				}
				this.queue(null);
			})
			.catch((reason) => {
				this.emit('error', reason);
			});
	});
}

interface LocalizeInfo {
	key: string;
	comment: string[];
}

module LocalizeInfo {
	export function is(value: any): value is LocalizeInfo {
		let candidate = value as LocalizeInfo;
		return Is.defined(candidate) && Is.string(candidate.key) && (Is.undef(candidate.comment) || (Is.array(candidate.comment) && candidate.comment.every(element => Is.string(element))));
	}
}

interface PackageJsonFormat {
	[key: string]: string | ValueFormat;
}

interface ValueFormat {
	message: string;
	comment: string[];
}

interface BundledExtensionFormat {
	[key: string]: {
		messages: string[];
		keys: (string | LocalizeInfo)[];
	};
}

module PackageJsonFormat {
	export function is(value: any): value is PackageJsonFormat {
		if (Is.undef(value) || !Is.object(value)) {
			return false;
		}
		return Object.keys(value).every(key => {
			let element = value[key];
			return Is.string(element) || (Is.object(element) && Is.defined(element.message) && Is.defined(element.comment));
		});
	}
}

export function packageADSExtensionsStream(): NodeJS.ReadWriteStream {
	const currentADSJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../i18nExtensions/ADSExtensions.json'), 'utf8'));
	const ADSExtensions = currentADSJson.ADSExtensions;
	const extenalExtensionDescriptions = (<string[]>glob.sync('extensions/*/package.json'))
		.map(manifestPath => {
			const extensionPath = path.dirname(path.join(root, manifestPath));
			const extensionName = path.basename(extensionPath);
			return { name: extensionName, path: extensionPath };
		})
		.filter(({ name }) => ADSExtensions[name] !== undefined);

	const builtExtensions = extenalExtensionDescriptions.map(extension => {
		return ext.fromLocal(extension.path, false)
			.pipe(rename(p => p.dirname = `extensions/${extension.name}/${p.dirname}`));
	});

	return es.merge(builtExtensions);
}

export function createXlfFilesForExtensions(): ThroughStream {
	let counter: number = 0;
	let folderStreamEnded: boolean = false;
	let folderStreamEndEmitted: boolean = false;
	return through(function (this: ThroughStream, extensionFolder: File) {
		const folderStream = this;
		const stat = fs.statSync(extensionFolder.path);
		if (!stat.isDirectory()) {
			return;
		}
		let extensionName = path.basename(extensionFolder.path);
		counter++;
		let _xlf: i18n.XLF;
		function getXlf() {
			if (!_xlf) {
				_xlf = new i18n.XLF(extensionsProject);
			}
			return _xlf;
		}
		gulp.src([`.locbuild/builtInExtensions/${extensionName}/package.nls.json`, `.locbuild/extensions/${extensionName}/package.nls.json`, `.locbuild/extensions/${extensionName}/**/nls.metadata.json`], { allowEmpty: true }).pipe(through(function (file: File) {
			if (file.isBuffer()) {
				const buffer: Buffer = file.contents as Buffer;
				const basename = path.basename(file.path);
				if (basename === 'package.nls.json') {
					const json: PackageJsonFormat = JSON.parse(buffer.toString('utf8'));
					const keys = Object.keys(json);
					const messages = keys.map((key) => {
						const value = json[key];
						if (Is.string(value)) {
							return value;
						} else if (value) {
							return value.message;
						} else {
							return `Unknown message for key: ${key}`;
						}
					});
					getXlf().addFile(`extensions/${extensionName}/package`, keys, messages);
				} else if (basename === 'nls.metadata.json') {
					const json: BundledExtensionFormat = JSON.parse(buffer.toString('utf8'));
					const relPath = path.relative(`.locbuild/extensions/${extensionName}`, path.dirname(file.path));
					for (let file in json) {
						const fileContent = json[file];
						getXlf().addFile(`extensions/${extensionName}/${relPath}/${file}`, fileContent.keys, fileContent.messages);
					}
				} else {
					this.emit('error', new Error(`${file.path} is not a valid extension nls file`));
					return;
				}
			}
		}, function () {
			if (_xlf) {
				let xlfFile = new File({
					path: path.join(extensionsProject, extensionName + '.xlf'),
					contents: Buffer.from(_xlf.toString(), 'utf8')
				});
				folderStream.queue(xlfFile);
			}
			this.queue(null);
			counter--;
			if (counter === 0 && folderStreamEnded && !folderStreamEndEmitted) {
				folderStreamEndEmitted = true;
				folderStream.queue(null);
			}
		}));
	}, function () {
		folderStreamEnded = true;
		if (counter === 0) {
			folderStreamEndEmitted = true;
			this.queue(null);
		}
	});
}
