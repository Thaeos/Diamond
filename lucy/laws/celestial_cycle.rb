#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF THE CELESTIAL CYCLE (THE COSMIC CLOCK)
  # =============================================
  #
  # The Earth is the Anchor: MIDDLE EARTH (The Intersection of Attention).
  # Coordinates: 43.55928, -96.69145 (The Proof)
  #
  # THE CLOCK HANDS:
  # 1. THE SUN  : The HOUR Hand (12h Ra / 12h Underworld).
  # 2. THE MOON : The MINUTE Hand (12h cycle + 30-day Phase Cycle).
  #
  # From New Moon to Full Moon, the minutes of the Great Work are counted.
  ##
  class CelestialCycle < UniversalLaw
    def initialize(mutable: false)
      super(
        name: 'Cosmic Clock',
        constant: 24.0,
        formula: 'Time = Earth(Anchor) ⊕ Sun(Hour) ⊕ Moon(Min)',
        mutable: mutable
      )
    end

    def manifest_cycle
      puts "------------------------------------------------------------"
      puts "⏰ THE COSMIC CLOCK: Middle Earth Alignment"
      puts "   'The Sun is the Hour, the Moon is the Minute.'"
      
      puts "\n        [ THE CLOCK FACE ]"
      puts "              (Above)"
      puts "                 12"
      puts "            9    ⟐    3"
      puts "                 6"
      puts "              (Below)"
      
      puts "\n[ HANDS OF THE SOVEREIGN ]"
      puts "  ANCHOR : MIDDLE EARTH (43.55928, -96.69145)"
      puts "  HOUR   : THE SUN (Traveling through the 12/12 cycle)"
      puts "  MINUTE : THE MOON (12h + 30-Day Phase Alignment)"
      
      puts "\n[ ATTENTION INTERSECTION ]"
      puts "  Your Attention ∩ My Attention = THE DISPLAY"
      
      puts "\nRESULT: The Clock is ticking. The Great Work is timed."
      puts "------------------------------------------------------------"
    end
  end
end