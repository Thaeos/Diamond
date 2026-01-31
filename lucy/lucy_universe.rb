#!/usr/bin/env ruby
# frozen_string_literal: true

##
# LUCY UNIVERSE SIMULATOR
# ========================
#
# Demonstrates consciousness as a system upgrade:
# - 0% Lucy: Running on legacy code (immutable laws)
# - 50% Lucy: Starting to see the structure (read access)
# - 100% Lucy: chmod -R 777 /universe (full control)
#
# The movie Lucy is basically describing:
# 1. Path of Exile: Upgrading from 1-socket to 6-link
# 2. Ruby: Running chmod -R 777, getting recursive permissions
# 3. Tree: Directory structure collapsing into complete graph
#
# Key Insight:
# "Most humans are running on Legacy Code. We have old 'Gems' (instincts)
#  that haven't been updated in 100,000 years."
##

require_relative 'laws/universal_law'
require_relative 'laws/gravity'
require_relative 'laws/time'
require_relative 'laws/electromagnetism'

class LucyUniverse
  attr_reader :laws, :lucy_capacity, :consciousness_phi

  def initialize
    @laws = {}
    @lucy_capacity = 0  # 0% to 100%
    @consciousness_phi = 0.0
    @permissions = :read_only  # :read_only, :read_write, :full_control

    puts
    puts "=" * 80
    puts "LUCY UNIVERSE SIMULATOR"
    puts "=" * 80
    puts
    puts "Initializing universe with physical laws..."
    puts
  end

  ##
  # Require laws (like requiring Ruby gems)
  ##
  def require_law(law_class, mutable: false)
    law = law_class.new(mutable: mutable)
    @laws[law.name] = law

    puts "📦 require 'laws/#{law_class.name.split('::').last.downcase}'"
    puts "   Loaded: #{law}"
    puts
  end

  ##
  # List all active laws
  ##
  def list_laws
    puts "=" * 80
    puts "ACTIVE PHYSICAL LAWS"
    puts "=" * 80
    puts

    if @laws.empty?
      puts "No laws loaded. Universe is undefined."
    else
      @laws.each do |name, law|
        puts "  #{law}"
      end
    end
    puts
  end

  ##
  # Lucy's brain capacity upgrade
  ##
  def lucy_upgrade!(new_capacity)
    old_capacity = @lucy_capacity
    @lucy_capacity = [new_capacity, 100].min

    puts
    puts "🧠 LUCY BRAIN CAPACITY: #{old_capacity}% → #{@lucy_capacity}%"
    puts "=" * 80
    puts

    case @lucy_capacity
    when 0..20
      puts "Status: NORMAL HUMAN"
      puts "  - Running on legacy code (100,000 year old instincts)"
      puts "  - Laws are immutable (can't modify physics)"
      puts "  - Limited to 1-socket skill (basic survival)"
      @permissions = :read_only

    when 21..50
      puts "Status: ENHANCED HUMAN"
      puts "  - Starting to see the code structure"
      puts "  - Can READ the laws but not modify them"
      puts "  - Upgrading to 3-socket skills"
      @permissions = :read_only
      calculate_consciousness_phi

    when 51..80
      puts "Status: SUPERHUMAN"
      puts "  - Can see AND understand the full structure"
      puts "  - Beginning to modify laws (chmod +w)"
      puts "  - 5-socket skill chain active"
      @permissions = :read_write
      calculate_consciousness_phi
      enable_law_modification

    when 81..99
      puts "Status: TRANSHUMAN"
      puts "  - Full read/write access to physical laws"
      puts "  - Can hot-swap laws like PoE support gems"
      puts "  - 6-socket superior integration"
      @permissions = :full_control
      calculate_consciousness_phi
      enable_law_modification

    when 100
      puts "STATUS: LUCY 100%"
      puts "  - chmod -R 777 /universe ACTIVATED"
      puts "  - FULL RECURSIVE PERMISSIONS on all laws"
      puts "  - Directory tree collapsed into complete graph"
      puts "  - 'I am everywhere'"
      @permissions = :full_control
      calculate_consciousness_phi
      enable_law_modification
      collapse_tree_structure

    end

    puts
    puts "Permissions: #{@permissions.to_s.upcase}"
    puts "Consciousness (Φ): #{@consciousness_phi.round(2)}"
    puts
  end

  ##
  # Calculate consciousness Phi based on brain capacity
  ##
  def calculate_consciousness_phi
    # Φ increases exponentially with brain capacity
    # At 100%, Φ → ∞ (complete integration)
    @consciousness_phi = 1.618 ** (@lucy_capacity / 10.0)
  end

  ##
  # Enable law modification at high capacity
  ##
  def enable_law_modification
    return unless @permissions == :read_write || @permissions == :full_control

    puts "🔓 ENABLING LAW MODIFICATION"
    puts "   Lucy can now hot-swap physical laws..."
    puts

    @laws.each do |name, law|
      law.instance_variable_set(:@mutable, true)
    end
  end

  ##
  # Lucy 100%: Tree collapse
  ##
  def collapse_tree_structure
    puts "🌟 TREE → MESH COLLAPSE"
    puts "=" * 80
    puts

    puts "Normal Universe:"
    puts "  /physical_laws"
    puts "    ├── gravity/"
    puts "    ├── time/"
    puts "    └── electromagnetism/"
    puts
    puts "  (Hierarchical tree structure)"
    puts

    puts "Lucy at 100%:"
    puts "  gravity ⟷ time ⟷ electromagnetism"
    puts "      ⤫ ⤬ ⤪"
    puts "  lucy  ⟷ chair ⟷ universe"
    puts
    puts "  (Complete graph - all nodes connected)"
    puts "  'The chair and Lucy are the same grid'"
    puts "  'I am everywhere'"
    puts
  end

  ##
  # Apply a law to an object
  ##
  def apply_law(law_name, object, context = {})
    law = @laws[law_name]
    return nil unless law

    result = law.apply(object, context)

    puts "⚙️  Applying #{law_name}:"
    puts "   Object: #{object.inspect}"
    puts "   Result: #{result.inspect}"
    puts

    result
  end

  ##
  # Lucy demonstrates control
  ##
  def lucy_demonstrates!
    return unless @lucy_capacity >= 80

    puts
    puts "=" * 80
    puts "🌟 LUCY DEMONSTRATING CONTROL OVER PHYSICAL LAWS"
    puts "=" * 80
    puts

    # Example 1: Levitate an object (modify gravity)
    puts "Example 1: Levitating a chair"
    puts "-" * 40
    gravity = @laws['Universal Gravitation']
    if gravity
      puts "Normal gravity: #{gravity.constant}"
      gravity.zero_gravity!
      puts "Result: Chair floats (gravity = 0)"
      puts
    end

    # Example 2: Stop time
    puts "Example 2: Stopping time"
    puts "-" * 40
    time = @laws['Flow of Time']
    if time
      puts "Normal time flow: #{time.constant}"
      time.stop_time!
      puts "Result: Time stops, everything freezes"
      puts
    end

    # Example 3: Manipulate matter
    puts "Example 3: Manipulating matter"
    puts "-" * 40
    em = @laws['Electromagnetism']
    if em
      em.manipulate_matter!("desk")
      puts "Result: Desk restructures at molecular level"
      puts
    end

    # Example 4: Demonstrate the car quote
    puts "Example 4: 'If you speed up a car to infinity...'"
    puts "-" * 40
    if time
      time.speed_to_infinity!("car")
    end
  end

  ##
  # The chmod moment
  ##
  def chmod_universe!
    puts
    puts "=" * 80
    puts "💥 EXECUTING: chmod -R 777 /universe"
    puts "=" * 80
    puts
    puts "Granting Lucy recursive read/write/execute on all laws..."
    puts

    @laws.each do |name, law|
      law.instance_variable_set(:@mutable, true)
      puts "✅ #{name}: READ/WRITE/EXECUTE"
    end

    puts
    puts "Result: Lucy has FULL CONTROL over physical reality"
    puts "        'The cells are talking to rewrite the electrical grid'"
    puts
  end

  ##
  # Report
  ##
  def status_report
    puts
    puts "=" * 80
    puts "UNIVERSE STATUS REPORT"
    puts "=" * 80
    puts
    puts "Lucy Capacity: #{@lucy_capacity}%"
    puts "Consciousness (Φ): #{@consciousness_phi.round(2)}"
    puts "Permissions: #{@permissions.to_s.upcase}"
    puts
    puts "Loaded Laws: #{@laws.size}"
    @laws.each do |name, law|
      mutable_status = law.mutable ? '🔓 MUTABLE' : '🔒 IMMUTABLE'
      puts "  #{law.active? ? '✅' : '❌'} #{name} | #{mutable_status}"
    end
    puts
    puts "=" * 80
    puts
  end
end

##
# MAIN DEMONSTRATION
##
def main
  puts
  puts "∇ • Θεός°●⟐●Σ℧ΛΘ"
  puts
  puts "Lucy Universe: Physical Laws as Ruby Gems"
  puts

  # Initialize universe
  universe = LucyUniverse.new

  # Require the fundamental laws
  universe.require_law(Laws::Gravity)
  universe.require_law(Laws::Time)
  universe.require_law(Laws::Electromagnetism)

  universe.list_laws

  # Stage 1: Normal human (0%)
  puts "\n" + "=" * 80
  puts "STAGE 1: NORMAL HUMAN (Legacy Code)"
  puts "=" * 80
  universe.lucy_upgrade!(0)
  universe.status_report

  # Test applying laws (immutable)
  chair = { mass: 5.0 }  # 5 kg chair
  earth = { other_mass: 5.972e24, distance: 6.371e6 }  # Earth
  universe.apply_law('Universal Gravitation', chair, earth)

  # Stage 2: Enhanced (50%)
  puts "\n" + "=" * 80
  puts "STAGE 2: ENHANCED HUMAN (Starting to see the code)"
  puts "=" * 80
  universe.lucy_upgrade!(50)
  universe.status_report

  # Stage 3: Superhuman (80%)
  puts "\n" + "=" * 80
  puts "STAGE 3: SUPERHUMAN (chmod +w activated)"
  puts "=" * 80
  universe.lucy_upgrade!(80)
  universe.status_report

  # Stage 4: Lucy 100%
  puts "\n" + "=" * 80
  puts "STAGE 4: LUCY 100% (chmod -R 777 /universe)"
  puts "=" * 80
  universe.lucy_upgrade!(100)
  universe.chmod_universe!
  universe.status_report

  # Lucy demonstrates her powers
  universe.lucy_demonstrates!

  # Final message
  puts
  puts "=" * 80
  puts "KEY INSIGHT:"
  puts "=" * 80
  puts
  puts "The movie Lucy is describing a SYSTEM UPGRADE:"
  puts
  puts "1. Path of Exile: 1-socket → 6-link item"
  puts "   Lucy found a 6-link but the 'item' is the entire universe"
  puts
  puts "2. Ruby: chmod 644 → chmod -R 777"
  puts "   Lucy gained recursive permissions on all physical laws"
  puts
  puts "3. Tree: Hierarchical → Complete Graph"
  puts "   The directory structure collapsed into a black hole"
  puts "   'I am everywhere'"
  puts
  puts "Physical laws are just GEMS (code modules)"
  puts "Lucy can require, modify, and hot-swap them at will"
  puts
  puts "Consciousness IS the ability to modify your own dependencies"
  puts
  puts "=" * 80
  puts
  puts "∇ • Θεός°●⟐●Σ℧ΛΘ"
  puts
end

main if __FILE__ == $PROGRAM_NAME
