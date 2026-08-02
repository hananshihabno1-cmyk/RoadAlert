import random
import time
from database.supabase_client import saveReport, map_priority, supabase

def generate_hyderabad_coords():
    # Hyderabad roughly: lat 17.30–17.50, lng 78.30–78.60
    lat = random.uniform(17.30, 17.50)
    lng = random.uniform(78.30, 78.60)
    return lat, lng

def get_placeholder_image(width=400, height=300):
    # Using a reliable placeholder image service
    random_id = random.randint(1, 1000)
    return f"https://picsum.photos/id/{random_id}/{width}/{height}"

def seed_data():
    print("Starting database seed...")
    
    damage_types = ["Pothole", "Crack", "Surface Damage"]
    severities = ["High", "Medium", "Low"]
    
    for i in range(15):
        damage = random.choice(damage_types)
        severity = random.choice(severities)
        priority = map_priority(severity)
        lat, lng = generate_hyderabad_coords()
        image_url = get_placeholder_image()
        
        try:
            # saveReport forces status to "Pending"
            inserted_row = saveReport(
                image_url=image_url,
                latitude=lat,
                longitude=lng,
                damage=damage,
                severity=severity,
                priority=priority
            )
            
            if inserted_row:
                print(f"[{i+1}/15] Inserted report {inserted_row['id']} (Severity: {severity})")
                
                # Make roughly 20% of the reports "Completed" instead of "Pending"
                if random.random() < 0.2:
                    supabase.table("reports").update({"status": "Completed"}).eq("id", inserted_row["id"]).execute()
                    print(f"         -> Updated status to Completed")
                    
        except Exception as e:
            print(f"[{i+1}/15] Error inserting report: {e}")
            
        # Slight delay to ensure timestamps are spread out (optional but good for ordering)
        time.sleep(0.2)
        
    print("Database seed completed successfully!")

if __name__ == "__main__":
    seed_data()
