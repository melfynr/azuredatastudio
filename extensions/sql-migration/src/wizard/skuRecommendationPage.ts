/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as path from 'path';
import { MigrationWizardPage } from '../models/migrationWizardPage';
import { MigrationStateModel, StateChangeEvent } from '../models/stateMachine';
import { Product, ProductLookupTable } from '../models/product';
import { SKU_RECOMMENDATION_PAGE_TITLE, SKU_RECOMMENDATION_CHOOSE_A_TARGET, CONGRATULATIONS, SKU_RECOMMENDATION_SOME_SUCCESSFUL } from '../models/strings';
import { Disposable } from 'vscode';
import { AssessmentResultsDialog } from '../dialog/assessmentResults/assessmentResultsDialog';
// import { SqlMigrationService } from '../../../../extensions/mssql/src/sqlMigration/sqlMigrationService';

export class SKURecommendationPage extends MigrationWizardPage {
	// For future reference: DO NOT EXPOSE WIZARD DIRECTLY THROUGH HERE.
	constructor(wizard: azdata.window.Wizard, migrationStateModel: MigrationStateModel) {
		super(wizard, azdata.window.createWizardPage(SKU_RECOMMENDATION_PAGE_TITLE), migrationStateModel);
	}

	protected async registerContent(view: azdata.ModelView) {
		await this.initialState(view);
	}

	private igComponent: azdata.FormComponent<azdata.TextComponent> | undefined;
	private detailsComponent: azdata.FormComponent<azdata.TextComponent> | undefined;
	private chooseTargetComponent: azdata.FormComponent<azdata.DivContainer> | undefined;
	private view: azdata.ModelView | undefined;

	private async initialState(view: azdata.ModelView) {
		this.igComponent = this.createStatusComponent(view); // The first component giving basic information
		this.detailsComponent = this.createDetailsComponent(view); // The details of what can be moved
		this.chooseTargetComponent = this.createChooseTargetComponent(view);


		const assessmentLink = view.modelBuilder.hyperlink()
			.withProperties<azdata.HyperlinkComponentProperties>({
				label: 'View Assessment Results',
				url: ''
			}).component();
		assessmentLink.onDidClick(async () => {
			let dialog = new AssessmentResultsDialog('ownerUri', this.migrationStateModel, 'Assessment Dialog');
			await dialog.openDialog();
		});

		const assessmentFormLink = {
			title: '',
			component: assessmentLink,
		};

		this.view = view;
		const form = view.modelBuilder.formContainer().withFormItems(
			[
				this.igComponent,
				this.detailsComponent,
				this.chooseTargetComponent,
				assessmentFormLink
			]
		);

		await view.initializeModel(form.component());
	}

	private createStatusComponent(view: azdata.ModelView): azdata.FormComponent<azdata.TextComponent> {
		const component = view.modelBuilder.text().withProperties<azdata.TextComponentProperties>({
			value: '',
		});

		return {
			title: '',
			component: component.component(),
		};
	}

	private createDetailsComponent(view: azdata.ModelView): azdata.FormComponent<azdata.TextComponent> {
		const component = view.modelBuilder.text().withProperties<azdata.TextComponentProperties>({
			value: '',
		});

		return {
			title: '',
			component: component.component(),
		};
	}

	private createChooseTargetComponent(view: azdata.ModelView) {
		const component = view.modelBuilder.divContainer();

		return {
			title: SKU_RECOMMENDATION_CHOOSE_A_TARGET,
			component: component.component()
		};
	}

	private constructDetails(): void {
		this.chooseTargetComponent?.component.clearItems();

		//TODO: Need to take assessment result and insert here
		//*** What service do I need to call to get the assessment results?
		this.igComponent!.component.value = CONGRATULATIONS;
		// either: SKU_RECOMMENDATION_ALL_SUCCESSFUL or SKU_RECOMMENDATION_SOME_SUCCESSFUL or SKU_RECOMMENDATION_NONE_SUCCESSFUL
		this.detailsComponent!.component.value = SKU_RECOMMENDATION_SOME_SUCCESSFUL(1, 1);
		this.constructTargets();
	}

	private constructTargets(): void {
		const products: Product[] = Object.values(ProductLookupTable);

		const rbg = this.view!.modelBuilder.radioCardGroup();
		rbg.component().cards = [];
		rbg.component().orientation = azdata.Orientation.Vertical;
		rbg.component().iconHeight = '30px';
		rbg.component().iconWidth = '30px';

		products.forEach((product) => {
			const imagePath = path.resolve(this.migrationStateModel.getExtensionPath(), 'media', product.icon ?? 'ads.svg');

			const descriptions: azdata.RadioCardDescription[] = [
				{
					textValue: product.name,
					linkDisplayValue: 'Learn more',
					displayLinkCodicon: true,
					textStyles: {
						'font-size': '1rem',
						'font-weight': 550,
					},
					linkCodiconStyles: {
						'font-size': '1em',
						'color': 'royalblue'
					}
				},
				{
					textValue: '9 databases will be migrated',
					linkDisplayValue: 'View/Change',
					displayLinkCodicon: true,
					linkCodiconStyles: {
						'font-size': '1em',
						'color': 'royalblue'
					}
				}
			];

			rbg.component().cards.push({
				id: product.name,
				icon: imagePath,
				descriptions
			});
		});

		this.chooseTargetComponent?.component.addItem(rbg.component());
	}

	private eventListener: Disposable | undefined;
	public async onPageEnter(): Promise<void> {
		this.eventListener = this.migrationStateModel.stateChangeEvent(async (e) => this.onStateChangeEvent(e));
		this.constructDetails();
	}

	public async onPageLeave(): Promise<void> {
		this.eventListener?.dispose();
	}

	protected async handleStateChange(e: StateChangeEvent): Promise<void> {
		switch (e.newState) {

		}
	}

}
