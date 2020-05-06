
//------------------------------------------------------------------------------
Ext.define('DSS.field_shapes.Delete', {
//------------------------------------------------------------------------------
	extend: 'Ext.Container',
	alias: 'widget.field_delete',
    alternateClassName: 'DSS.DeleteFieldShapes',
    singleton: true,	
	
    autoDestroy: false,
    
    scrollable: 'y',

	layout: DSS.utils.layout('vbox', 'start', 'stretch'),
	
	//--------------------------------------------------------------------------
	initComponent: function() {
		let me = this;

		Ext.applyIf(me, {
			items: [{
				xtype: 'component',
				cls: 'section-title light-text text-drp-20',
				html: 'Field Shapes <i class="fas fa-trash-alt fa-fw accent-text text-drp-50"></i>',
				height: 35
			},{
				xtype: 'container',
				style: 'background-color: #666; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0.2)',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				margin: '8 4',
				padding: '2 8 10 8',
				defaults: {
					DSS_parent: me,
				},
				items: [{
					xtype: 'component',
					cls: 'information light-text text-drp-20',
					html: 'Delete Field',
				},{
					xtype: 'component',
					cls: 'information light-text text-drp-20',
					html: 'Click a field to delete it',
				}]
			}]
		});
		
		me.callParent(arguments);
	},
	
	//--------------------------------------------------------------------------
	addModeControl: function() {
		let me = this;
		let c = DSS_viewport.down('#DSS-mode-controls');
		
		if (!c.items.has(me)) {
			Ext.suspendLayouts();
				c.removeAll(false);
				c.add(me);
			Ext.resumeLayouts(true);
		}
		me.mouseMoveDeleteHandler();
		me.clickDeleteFieldHandler();
	},
	
    //-------------------------------------------------------------
	mouseMoveDeleteHandler: function() {
		
		// FIXME: Seems to be getting duplicate features. Bad feature list (from server query)?
		//	multiple map layers?? Other???
		DSS.layer.MouseOver.setVisible(true);
		DSS.mouseMoveFunction = function(evt) {
			let pixel = DSS.map.getEventPixel(evt.originalEvent);
			let fs = DSS.map.getFeaturesAtPixel(pixel);
			let cursor = '';
			let hitAny = false;
			let mouseList = [];
			DSS.layer.MouseOver.getSource().clear(true);
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (!g) return;
				if (g.getType() === "Polygon") {
					cursor = 'pointer';
					hitAny = true;
					mouseList.push(f);
					
					let extent = g.getExtent();
					let center = ol.extent.getCenter(extent);
					center[1] += (ol.extent.getHeight(extent) / 2);
					center = g.getClosestPoint(center);
				}
			})
			if (hitAny) {
				DSS.layer.MouseOver.getSource().addFeatures(mouseList);
			}
			DSS.map.getViewport().style.cursor = cursor;
		}		
	},
	
    //-------------------------------------------------------------
    clickDeleteFieldHandler: function(evt) {
    	
    	DSS.mapClickFunction = function(evt) {
			let pixel = DSS.map.getEventPixel(evt.originalEvent);
			let fs = DSS.map.getFeaturesAtPixel(pixel);
			let hitAny = false;
			let deleteList = [];
			fs.forEach(function(f) {
				let g = f.getGeometry();
				if (!g) return;
				if (g.getType() === "Polygon") {
					hitAny = true;
					deleteList.push(f.getProperties().f_id)
				}
			})
			if (hitAny) {
				console.log(deleteList);
			}
		}		
    },

	
});