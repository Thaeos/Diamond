#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF UNIVERSAL GRAVITATION
  # =============================
  #
  # Newton's Law: F = G * (m1 * m2) / r²
  #
  # Where:
  #   G = 6.674 × 10^-11 m³/(kg·s²) (Gravitational constant)
  #   F = Force between two masses
  #   m1, m2 = Masses of objects
  #   r = Distance between centers
  #
  # In Lucy's universe:
  # - At 0%: Gravity is fixed (immutable)
  # - At 100%: Lucy can modify G or the formula itself
  # - She can make objects "float" by setting G = 0
  # - She can increase gravity to crush objects
  ##
  class Gravity < UniversalLaw
    G = 6.674e-11  # Gravitational constant

    def initialize(mutable: false)
      super(
        name: 'Universal Gravitation',
        constant: G,
        formula: 'F = G * (m1 * m2) / r²',
        mutable: mutable
      )
    end

    ##
    # Calculate gravitational force between two objects
    ##
    def apply(object, context = {})
      return 0 unless @active

      m1 = object[:mass]
      m2 = context[:other_mass] || 0
      r = context[:distance] || 1

      # F = G * (m1 * m2) / r²
      force = @constant * (m1 * m2) / (r ** 2)

      {
        force: force,
        direction: :toward,
        law: @name
      }
    end

    ##
    # Lucy's modifications
    ##
    def increase_gravity!(multiplier)
      modify!(new_constant: @constant * multiplier)
    end

    def decrease_gravity!(divisor)
      modify!(new_constant: @constant / divisor)
    end

    def zero_gravity!
      modify!(new_constant: 0)
    end

    def invert_gravity!
      modify!(
        new_constant: -@constant.abs,
        new_formula: 'F = -G * (m1 * m2) / r² (REPULSIVE)'
      )
    end
  end
end
