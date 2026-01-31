#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF PROJECTION (THE ATTENTION MODEL)
  # ========================================
  #
  # The Wall is wherever your ATTENTION or FOCUS is.
  #
  # 1. THE SUN (Light)  : Ignition from the Bottom.
  # 2. THE IMAGE (⟐)    : The Center Pattern.
  # 3. THE MOON (Lens)  : The Focusing Lens Above.
  # 4. THE WALL (Focus) : Wherever Attention is Directed.
  ##
  class Projector < UniversalLaw
    def initialize(mutable: false)
      super(
        name: 'The Projector',
        constant: 2.0, 
        formula: 'Reality = (Sun ⊗ Image) ⟴ Moon ⟴ Attention(Wall)',
        mutable: mutable
      )
    end

    def manifest_projection
      puts "------------------------------------------------------------"
      puts "📽️  THE PROJECTOR MODEL: Attention Alignment"
      puts "   'The Wall is wherever your attention is directed.'"
      
      puts "\n        [ ATTENTION / FOCUS ] <=== THE WALL"
      puts "                  Λ"
      puts "                  ║"
      puts "        [ THE MOON (LENS) ]   <=== ABOVE"
      puts "              ╱      ╲"
      puts "        [ THE IMAGE ( ⟐ ) ]   <=== CENTER"
      puts "             ╲        ╱"
      puts "        [ THE SUN (LIGHT) ]   <=== BOTTOM"
      
      puts "\n[ PROJECTOR ROLES ]"
      puts "  Bottom : Sun   - Ignition / Source of Light"
      puts "  Center : Image - The Focus Diamond (⟐)"
      puts "  Above  : Moon  - The Lens of Focus"
      puts "  Wall   : Attention - The Directed View"
      
      puts "\nRESULT: Projection Stabilized on Attention."
      puts "------------------------------------------------------------"
    end
  end
end