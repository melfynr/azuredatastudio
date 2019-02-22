/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { RGBA8 } from 'vs/editor/common/core/rgba';
import { Constants } from 'vs/editor/common/view/minimapCharRenderer';
import { getOrCreateMinimapCharRenderer } from 'vs/editor/common/view/runtimeMinimapCharRenderer';
import { MinimapCharRendererFactory } from 'vs/editor/test/common/view/minimapCharRendererFactory';

suite('MinimapCharRenderer', () => {

	let sampleData: Uint8ClampedArray = null;

	suiteSetup(() => {
		sampleData = new Uint8ClampedArray(Constants.SAMPLED_CHAR_HEIGHT * Constants.SAMPLED_CHAR_WIDTH * Constants.RGBA_CHANNELS_CNT * Constants.CHAR_COUNT);
	});

	suiteTeardown(() => {
		sampleData = null;
	});

	setup(() => {
		for (let i = 0; i < sampleData.length; i++) {
			sampleData[i] = 0;
		}

	});

	const sampleD = [
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xd0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xd0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xd0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x0d, 0xff, 0xff, 0xff, 0xa3, 0xff, 0xff, 0xff, 0xf3, 0xff, 0xff, 0xff, 0xe5, 0xff, 0xff, 0xff, 0x5e, 0xff, 0xff, 0xff, 0xd0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xa4, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xf7, 0xff, 0xff, 0xff, 0xfc, 0xff, 0xff, 0xff, 0xf0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0xff, 0xff, 0xff, 0x10, 0xff, 0xff, 0xff, 0xfb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x94, 0xff, 0xff, 0xff, 0x02, 0xff, 0xff, 0xff, 0x6a, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0xff, 0xff, 0xff, 0x3b, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x22, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0xff, 0xff, 0xff, 0xf0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0xff, 0xff, 0xff, 0x47, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xd6, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0xff, 0xff, 0xff, 0x31, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xe7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0xff, 0xff, 0xff, 0x0e, 0xff, 0xff, 0xff, 0xf7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x69, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x3d, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x9b, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xf9, 0xff, 0xff, 0xff, 0xb9, 0xff, 0xff, 0xff, 0xf0, 0xff, 0xff, 0xff, 0xf7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x0e, 0xff, 0xff, 0xff, 0xa7, 0xff, 0xff, 0xff, 0xf5, 0xff, 0xff, 0xff, 0xe8, 0xff, 0xff, 0xff, 0x71, 0xff, 0xff, 0xff, 0xd0, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x78, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	];

	function setSampleData(charCode: number, data: number[]) {
		const rowWidth = Constants.SAMPLED_CHAR_WIDTH * Constants.RGBA_CHANNELS_CNT * Constants.CHAR_COUNT;
		let chIndex = charCode - Constants.START_CH_CODE;

		let globalOutputOffset = chIndex * Constants.SAMPLED_CHAR_WIDTH * Constants.RGBA_CHANNELS_CNT;
		let inputOffset = 0;
		for (let i = 0; i < Constants.SAMPLED_CHAR_HEIGHT; i++) {
			let outputOffset = globalOutputOffset;
			for (let j = 0; j < Constants.SAMPLED_CHAR_WIDTH; j++) {
				for (let channel = 0; channel < Constants.RGBA_CHANNELS_CNT; channel++) {
					sampleData[outputOffset] = data[inputOffset];
					inputOffset++;
					outputOffset++;
				}
			}
			globalOutputOffset += rowWidth;
		}
	}

	function createFakeImageData(width: number, height: number): ImageData {
		return {
			width: width,
			height: height,
			data: new Uint8ClampedArray(width * height * Constants.RGBA_CHANNELS_CNT)
		};
	}

	test('letter d @ 2x', () => {
		setSampleData('d'.charCodeAt(0), sampleD);
		let renderer = MinimapCharRendererFactory.create(sampleData);

		let background = new RGBA8(0, 0, 0, 255);
		let color = new RGBA8(255, 255, 255, 255);
		let imageData = createFakeImageData(Constants.x2_CHAR_WIDTH, Constants.x2_CHAR_HEIGHT);
		// set the background color
		for (let i = 0, len = imageData.data.length / 4; i < len; i++) {
			imageData.data[4 * i + 0] = background.r;
			imageData.data[4 * i + 1] = background.g;
			imageData.data[4 * i + 2] = background.b;
			imageData.data[4 * i + 3] = 255;
		}
		renderer.x2RenderChar(imageData, 0, 0, 'd'.charCodeAt(0), color, background, false);

		let actual: number[] = [];
		for (let i = 0; i < imageData.data.length; i++) {
			actual[i] = imageData.data[i];
		}
		assert.deepEqual(actual, [
			0x00, 0x00, 0x00, 0xff, 0x6d, 0x6d, 0x6d, 0xff,
			0xbb, 0xbb, 0xbb, 0xff, 0xbe, 0xbe, 0xbe, 0xff,
			0x94, 0x94, 0x94, 0xff, 0x7e, 0x7e, 0x7e, 0xff,
			0xb1, 0xb1, 0xb1, 0xff, 0xbb, 0xbb, 0xbb, 0xff,
		]);
	});

	test('letter d @ 2x at runtime', () => {
		let renderer = getOrCreateMinimapCharRenderer();

		let background = new RGBA8(0, 0, 0, 255);
		let color = new RGBA8(255, 255, 255, 255);
		let imageData = createFakeImageData(Constants.x2_CHAR_WIDTH, Constants.x2_CHAR_HEIGHT);
		// set the background color
		for (let i = 0, len = imageData.data.length / 4; i < len; i++) {
			imageData.data[4 * i + 0] = background.r;
			imageData.data[4 * i + 1] = background.g;
			imageData.data[4 * i + 2] = background.b;
			imageData.data[4 * i + 3] = 255;
		}

		renderer.x2RenderChar(imageData, 0, 0, 'd'.charCodeAt(0), color, background, false);

		let actual: number[] = [];
		for (let i = 0; i < imageData.data.length; i++) {
			actual[i] = imageData.data[i];
		}
		assert.deepEqual(actual, [
			0x00, 0x00, 0x00, 0xff, 0x6d, 0x6d, 0x6d, 0xff,
			0xbb, 0xbb, 0xbb, 0xff, 0xbe, 0xbe, 0xbe, 0xff,
			0x94, 0x94, 0x94, 0xff, 0x7e, 0x7e, 0x7e, 0xff,
			0xb1, 0xb1, 0xb1, 0xff, 0xbb, 0xbb, 0xbb, 0xff,
		]);
	});

	test('letter d @ 1x', () => {
		setSampleData('d'.charCodeAt(0), sampleD);
		let renderer = MinimapCharRendererFactory.create(sampleData);

		let background = new RGBA8(0, 0, 0, 255);
		let color = new RGBA8(255, 255, 255, 255);
		let imageData = createFakeImageData(Constants.x1_CHAR_WIDTH, Constants.x1_CHAR_HEIGHT);
		// set the background color
		for (let i = 0, len = imageData.data.length / 4; i < len; i++) {
			imageData.data[4 * i + 0] = background.r;
			imageData.data[4 * i + 1] = background.g;
			imageData.data[4 * i + 2] = background.b;
			imageData.data[4 * i + 3] = 255;
		}

		renderer.x1RenderChar(imageData, 0, 0, 'd'.charCodeAt(0), color, background, false);

		let actual: number[] = [];
		for (let i = 0; i < imageData.data.length; i++) {
			actual[i] = imageData.data[i];
		}
		assert.deepEqual(actual, [
			0x55, 0x55, 0x55, 0xff,
			0x93, 0x93, 0x93, 0xff,
		]);
	});

	test('letter d @ 1x at runtime', () => {
		let renderer = getOrCreateMinimapCharRenderer();

		let background = new RGBA8(0, 0, 0, 255);
		let color = new RGBA8(255, 255, 255, 255);
		let imageData = createFakeImageData(Constants.x1_CHAR_WIDTH, Constants.x1_CHAR_HEIGHT);
		// set the background color
		for (let i = 0, len = imageData.data.length / 4; i < len; i++) {
			imageData.data[4 * i + 0] = background.r;
			imageData.data[4 * i + 1] = background.g;
			imageData.data[4 * i + 2] = background.b;
			imageData.data[4 * i + 3] = 255;
		}

		renderer.x1RenderChar(imageData, 0, 0, 'd'.charCodeAt(0), color, background, false);

		let actual: number[] = [];
		for (let i = 0; i < imageData.data.length; i++) {
			actual[i] = imageData.data[i];
		}
		assert.deepEqual(actual, [
			0x55, 0x55, 0x55, 0xff,
			0x93, 0x93, 0x93, 0xff,
		]);
	});

});