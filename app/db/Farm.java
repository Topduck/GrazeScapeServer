package db;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;
import utils.Json;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;

import io.ebean.Ebean;
import io.ebean.Finder;
import io.ebean.Model;
import io.ebean.SqlRow;
import play.mvc.Http.Request;

@Entity
public class Farm extends Model {
	
	@Id
    public Long id;

    public String farmName;
    public String farmOwner;
    public String farmAddress;
    
    @OneToMany(cascade = CascadeType.ALL)
    public List<FieldGeometry> fieldGeometry = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL)
    public List<Scenario> scenarios = new ArrayList<>();
    
    // WKT format, blah
    @Column(columnDefinition = "TEXT")
	public String location;
 
    
    //----------------------------------------------------------
    
    public Farm name(String farmName) {
    	this.farmName = farmName;
    	return this;
    }
    public Farm owner(String farmOwner) {
    	this.farmOwner = farmOwner;
    	return this;
    }
    public Farm address(String farmAddress) {
    	this.farmAddress = farmAddress;
    	return this;
    }
 
    public Farm location(Float x, Float y) {
		SqlRow sw = Ebean.createSqlQuery("SELECT ST_AsText(ST_POINT(?,?)) as wkt_pt")
				.setParameter(1, x)
				.setParameter(2, y)
				.findOne();
		
		this.location = sw.getString("wkt_pt");
		return this;
    }
    
    //------------------------------------------------------
    public static void testLoadShapes() {
    	
    	File file = new File("./public/shapeFiles/exampleFields.geojson");
    	JsonNode fasJson = null;
    	Farm f = new Farm().
    			name("Grazing Acres").
    			owner("Jeff Dischler").
    			address("1034 Friar Ln.");
    	
    	try (FileInputStream fis = new FileInputStream(file)) {
    		fasJson = play.libs.Json.parse(fis);
            f.createFieldsFrom(fasJson);
    	}
    	catch(Exception e) {
			logger.error(e.toString());
    	}
    	f.save();
    }
   
    //------------------------------------------------------------
    public void createFieldsFrom(JsonNode geom) {

		ArrayNode featureList = (ArrayNode)geom.get("features");
		ObjectMapper om = new ObjectMapper();
		
		for (int idx = 0; idx < featureList.size(); idx++) {
			JsonNode feature = featureList.get(idx);
			
			// NOTE: just an example of getting the properties. Nothing is done with them right now but if field shapes
			//	included any extra data, such as OM, P, whatever...Then we could also extract that and do something useful.
			int f_id = 0;
			JsonNode props = feature.get("properties");
			if (props != null) {
				f_id = props.get("f_id").asInt();
			}
			
			JsonNode geo = feature.get("geometry");
			try {
				String geoJson = om.writeValueAsString(geo);
				
				FieldGeometry fg = new FieldGeometry()
						.fromGeoJSON(geoJson);
				//		.fromWKT(wkt); //TODO
	
				this.fieldGeometry.add(fg);
				
			} catch (JsonProcessingException e) {
				logger.error(e.toString());
			}
		}
    }

    //----------------------------------------------------
    public String getFieldShapesAsGeoJson() {
    	
    	StringBuilder sb = new StringBuilder(2048);
    	
    	sb.append("{\"type\":\"FeatureCollection\",\"name\":\"shapes\"," +
        		"\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:EPSG::3857\"}}," +
        		"\"features\":[");
    	
    	boolean isFirst = true;
    	if (this.scenarios.size() > 0) {
	    	for (Field f: this.scenarios.get(0).mFields) {
	    		if (!isFirst) sb.append(",");
	
	    		SqlRow sw;
//	    		sw = Ebean.createSqlQuery("SELECT ST_AsGeoJSON(ST_GeomFromText( ? )) as gjson")
	    		sw = Ebean.createSqlQuery("SELECT ST_AsGeoJSON(ST_Buffer(ST_GeomFromText( ? ), -0.5)) as gjson")
	    				.setParameter(1, f.geometry.geom)
	    				.findOne();
	    		
	    		sb.append("{\"type\":\"Feature\",\"geometry\":");
	    		sb.append(sw.getString("gjson"));
	    		sb.append(",\"properties\":{");
	    		sb.append("\"f_id\":" + f.geometry.id);
	    		if (f.rotation != null) {
	    			sb.append(",\"rotation\":\"" + f.rotation.dbValue + "\"");
	    		}
	    		sb.append("}}");
	    		
	    		isFirst = false;
	    	}
    	}
    	sb.append("]}");

    	return sb.toString();
    }
    
    //----------------------------------------------------
	public JsonNode getProperties() {
		return Json.pack("id",this.id,
			"name", this.farmName,
			"owner", this.farmOwner,
			"address", this.farmAddress
		);
				
	}
    //----------------------------------------------------
	public JsonNode getFeature() {
		SqlRow sw = Ebean.createSqlQuery("SELECT ST_AsGeoJSON(ST_GeomFromText(?)) as json")
				.setParameter(1, this.location)
				.findOne();
		
		JsonNode geoJson = play.libs.Json.parse(sw.getString("json"));
		
		return Json.pack("type", "Feature",
			"geometry", geoJson,
			"properties", this.getProperties()
		);
	}
    
    //----------------------------------------------------
    public static JsonNode getAllAsGeoJson() {
		JsonNode crs = Json.pack(
			"type", "name",
			"properties", Json.pack(
				"name", "urn:ogc:def:crs:EPSG::3857"
			)
		);

		ArrayNode features = JsonNodeFactory.instance.arrayNode();
		
		List<Farm> fs = Farm.find.all();
		for (Farm f: fs) {
			features.add(f.getFeature());
		}
		
		return Json.pack(
			"type", "FeatureCollection",
			"name", "farmSet",//"TainterSimpleBoundary",
			"crs", crs,
			"features", features
		);		
    }
    
    public static final Finder<Long, Farm> find = new Finder<>(Farm.class);
    
    private static final Logger logger = LoggerFactory.getLogger("app");

    // Ensure that the baseline scenario exists...
    //------------------------------------------------------
    private void createBaselineIfNeeded() {
    	
		if (this.scenarios.size() < 1) {
			Scenario sc = new Scenario();
			sc.farm = this;
			sc.isBaseline = true;
			sc.scenarioName = "Baseline";
			this.scenarios.add(sc);
			this.save();
		}
    }
    
    //------------------------------------------------------
	public static JsonNode addField(Request request) {
		
		JsonNode node = request.body().asJson();

		Long farmId = utils.Json.safeGetLong(node, "farm_id");
		String wkt = utils.Json.safeGetString(node, "wkt");
		JsonNode settings =  node.get("field_settings");
		logger.debug(settings.toString());
		
		Long field_id = -1L;
		
		db.Farm f = db.Farm.find.byId(farmId);
		if (f != null) {
			FieldGeometry fg = new FieldGeometry();
			fg.fromWKT(wkt);
			fg.farm = f;
			f.fieldGeometry.add(fg);
			f.save();
			field_id = fg.id;
			f.createBaselineIfNeeded();
			
			for (Scenario s: f.scenarios) {
				Field newField = new Field().withSettings(settings);
				newField.geometry = fg;
				s.mFields.add(newField);
				s.save();
			}
			f.save();
		}
		
		return utils.Json.pack("f_id", field_id);
	}
}
