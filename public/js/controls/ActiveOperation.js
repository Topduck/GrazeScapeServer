
//------------------------------------------------------------------------------
Ext.define('DSS.controls.ActiveOperation', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.active_operation',

	layout: DSS.utils.layout('vbox', 'center', 'stretch'),
	padding: 8,
	
	DSS_TODO: 'Link control into farm operation details (name, address, location, blah)',
		
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;
		
		Ext.applyIf(me, {
			defaults: {
				margin: '2rem',
			},
			items: [{
				xtype: 'component',
				cls: 'lightweight-title',
				html: 'Operation'
			},{ 
				xtype: 'container',
				layout: DSS.utils.layout('hbox', 'center', 'stretch'),
				defaults: {
					xtype: 'component',
					cls: 'primary-title',
				},				
				items: [{
					padding: '0 8rem',
					html: 'Grazing Acres'
				},{
					html: '<i class="fas fa-edit"></i>'
				}]
			}]
		});
		
		me.callParent(arguments);
	}

});
