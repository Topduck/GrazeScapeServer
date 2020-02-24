

DSS.utils.addStyle('.x-mask { background-color: rgba(0,0,0,0.5);}')
DSS.utils.addStyle('.footer-text { background: rgba(0,0,0,0.5);padding: 0.72rem; color: #fff; font-size: 0.8rem; text-align: center}')

// Section that roughly corresponds to the left portion of the application. This area will contain logos, titles, controls, etc
//	and generally be the starting point/container for controlling the entire application flow...whereas the remainder of the
//	application space will contain (primarily) the map display but will be switched out as needed for charts/reports/other.

//------------------------------------------------------------------------------
Ext.define('DSS.controls.ApplicationFlow', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.application_flow',

	requires: [
		'DSS.controls.LogoBase',
		'DSS.controls.OperationInfo',
		'DSS.controls.OperationsBase',
		'DSS.controls.CompareOperationsBase',
		'DSS.controls.GrazingToolsBase',
		'DSS.controls.ActiveOperation',
		'DSS.controls.NavigationMenu',
		'DSS.controls.TitleBase',
		'DSS.controls.FieldShapesBase',
		'DSS.controls.ScenarioBuilder',
	],
	
	layout: DSS.utils.layout('vbox', 'start', 'stretch'),

	DSS_minTitleHeight: 64,
	
	listeners: {
		afterrender: function(self) {
			self.showLandingPage()
		}
	},
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		DSS['ApplicationFlow'] = {instance: me};
		me.DSS_App = {};
		
		Ext.applyIf(me, {
			items: [{
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'start', 'stretch'),
				
				// Top Section (Logo, Titles, MenuWidgets, and general application flow controls)
				//----------------------------------------------------------------------------------
				items: [{
					xtype: 'component',
					cls: 'primary-title',
					padding: '4 8',
					html: '<i class="fas fa-bars"></i>',
					listeners: {
						render: function(c) {
							c.getEl().getFirstChild().el.on({
								click: function() {
									Ext.create({xtype: 'navigation_menu'}).showMenu();
								}
							});
						}
					}					
				},{
					xtype: 'container',
					flex: 1,
					minHeight: me.DSS_minTitleHeight,
					listeners: {
						afterrender: function(self) { me.DSS_App = {TitleContainer: self} }
					}					
				},{
					xtype: 'component',
					padding: '4 8',

					cls: 'primary-title',
					html: '<i class="fas fa-user"></i>'
				}]
			},{
				// Container for controls necessary at each step in the application flow
				//----------------------------------------------------------------------------------
				xtype: 'container',
				scrollable: true,
				flex: 1,
				listeners: {
					afterrender: function(self) { me.DSS_App['FlowContainer'] = self }
				}			
			},{
				// Footer, possible should hide when not on the "landing" portion of the grazescape application 
				//----------------------------------------------------------------------------------
				xtype: 'component',
				cls: 'footer-text',
				html: 'GrazeScape<br>Footer / Copyright ©2020'
			}]
		});
		
		me.callParent(arguments);

		//----------------------------------------------------------------------------------
		window.onhashchange = function() {
			event.preventDefault();
			event.stopPropagation();
		}		
	},
	
	// ExtDef can be a component, an array of components, an objectDef, or an array of objectDefs
	//----------------------------------------------------------------------------------
	setTitleBlock: function(extDef) {
		let me = this;
		me.DSS_App.TitleContainer.removeAll();
		me.DSS_App.TitleContainer.add(extDef);
	},
	
	//----------------------------------------------------------------------------------
	setControlBlock: function(extDef) {
		let me = this;
		me.DSS_App.FlowContainer.removeAll();
		me.DSS_App.FlowContainer.add(extDef);
	},
	
	// SHOW Handling -------------------------------------------------------------------
	//
	//----------------------------------------------------------------------------------
	showLandingPage: function() {
		let me = this;
		
		Ext.suspendLayouts();
			me.setTitleBlock({xtype: 'logo_base'});
			me.setControlBlock([
				DSS.controls.OperationsBase.get(),
				DSS.controls.CompareOperationsBase.get(),
				DSS.controls.GrazingToolsBase.get()
			]);
		Ext.resumeLayouts(true);
	},
	
	//----------------------------------------------------------------------------------
	showNewOperationPage: function() {
		let me = this;
		
		Ext.suspendLayouts();
			me.setTitleBlock({xtype: 'title_base'}); // DSS_primaryTitle, DSS_secondaryTitle
			me.setControlBlock([
				DSS.controls.OperationInfo.get(),
			]);
		Ext.resumeLayouts(true);
	},
	
	//----------------------------------------------------------------------------------
	showManageOperationPage: function() {
		let me = this;
		
		Ext.suspendLayouts();
			me.setTitleBlock({xtype: 'active_operation'});
			me.setControlBlock([{	xtype: 'field_shapes_base'},
				{ xtype: 'scenario_builder'}]);
		Ext.resumeLayouts(true);
	}
	
	
	
	/* If and when needed....
	 
	DSS.layer.farms.setVisible(true);                    	
	DSS.layer.farms.setOpacity(1.0);
	DSS.layer.fields.setVisible(false);                    	
	
	me.DSS_realtimeDashboard.animate({
		dynamic: true, duration: 300,
		to: {
			width: 0
		}
	})
	
	DSS.map.getView().fit([-10126000, 5360000, -10110000, 5390000], {duration: 1000});
},*/

	
});
