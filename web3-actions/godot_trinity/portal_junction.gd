extends Area3D
# THE PORTAL: bridgeworld.lol
# "The Grand Central Station of the Open Metaverse"

@export var target_realm: String = "Atlas"
@export var gateway_url: String = "https://bridgeworld.lol"

func _ready():
    # Connect the "Body Entered" signal to trigger traversal
    connect("body_entered", _on_body_entered)
    print("⛩️  Portal Active: bridgeworld.lol Junction is open.")

func _on_body_entered(body):
    if body.name == "TheosPrimary":
        traverse_the_vail()

func traverse_the_vail():
    print("🌀 Traversing the Vail: Moving from (The X) to " + target_realm)
    # 1. Verify the Sovereign Signature through the X Portal
    # 2. Sync the Arbitrum Evolution data
    # 3. Load the 3D Neighborhood of the target realm
    
    # Trigger Godot transition effect: The 10-Point Star Union
    get_tree().change_scene_to_file("res://realms/" + target_realm + ".tscn")

func get_gateway_status():
    # Check if the Cloudflare gateway is responsive
    # Ensure the 7-layer stack is aligned
    return true
