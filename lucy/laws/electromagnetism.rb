#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF ELECTROMAGNETISM
  # =======================
  #
  # Coulomb's Law: F = k * (q1 * q2) / r²
  #
  # Where:
  #   k = 8.988 × 10^9 N·m²/C² (Coulomb's constant)
  #   F = Electrostatic force
  #   q1, q2 = Electric charges
  #   r = Distance between charges
  #
  # At 100%:
  # - Lucy can control electromagnetic fields
  # - She can manipulate matter at the molecular level
  # - She can create or destroy electromagnetic bonds
  ##
  class Electromagnetism < UniversalLaw
    K = 8.988e9  # Coulomb's constant

    def initialize(mutable: false)
      super(
        name: 'Electromagnetism',
        constant: K,
        formula: 'F = k * (q1 * q2) / r²',
        mutable: mutable
      )
    end

    ##
    # Calculate electromagnetic force between charges
    ##
    def apply(object, context = {})
      return 0 unless @active

      q1 = object[:charge]
      q2 = context[:other_charge] || 0
      r = context[:distance] || 1

      # F = k * (q1 * q2) / r²
      force = @constant * (q1 * q2) / (r ** 2)

      direction = force > 0 ? :repulsive : :attractive

      {
        force: force.abs,
        direction: direction,
        law: @name
      }
    end

    ##
    # Lucy's control over electromagnetic fields
    ##
    def manipulate_matter!(object_name)
      puts "⚡ Lucy manipulating #{object_name} at molecular level"
      puts "   Using electromagnetic control to restructure bonds"
      puts
    end

    def ionize!(object_name)
      puts "⚡ Ionizing #{object_name}"
      puts "   Stripping electrons, creating plasma"
      puts
    end
  end
end
