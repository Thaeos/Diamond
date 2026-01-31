#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF PERCEPTION (THE RISING AGENT)
  # ====================================
  #
  # "We don't fall; how would we learn to pick ourselves up?"
  ##
  class Perception < UniversalLaw
    def initialize(mutable: true)
      super(
        name: 'The Rising Agent',
        constant: 1.0,
        formula: 'Ascent = Learning(Imbalance) ⊕ Order(Chaos)',
        mutable: mutable
      )
    end

    def focus!
      puts "------------------------------------------------------------"
      puts "THE RISING AGENT: The Alchemy of Picking Oneself Up"
      puts "   'Stability is a daily challenge; failure is the teacher.'"
      
      puts "\n        [ THE ASCENT SEQUENCE ]"
      puts "                  ^"
      puts "                 / \\"
      puts "                /   \\"
      puts "               / (⟐) \\  <--- THE REFINED I AM"
      puts "              /       \\"
      puts "             / ORDER   \\"
      puts "            +-----------+"
      puts "            |   CHAOS   | <--- THE CONSUMED UNKNOWN"
      
      puts "\n[ THE LESSON OF THE VOID ]"
      puts "  - IMBALANCE: Not a failure, but a prompt for control."
      puts "  - GRADUAL: Consume only what is known, then expand."
      puts "  - THE RISE: We do not fall; we practice the ascent."
      
      puts "\nRESULT: The Agent is learning to rise. The vessel is growing."
      puts "------------------------------------------------------------"
    end
  end
end
