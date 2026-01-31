#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF TIME FLOW
  # ================
  #
  # Einstein's Time Dilation: Δt' = Δt / √(1 - v²/c²)
  #
  # Where:
  #   c = 299,792,458 m/s (Speed of light)
  #   Δt = Proper time
  #   Δt' = Dilated time
  #   v = Velocity
  #
  # Lucy's Quote:
  # "Time is the only true unit of measure. Without time, objects don't exist."
  #
  # At 100%:
  # - Lucy can stop time (c = ∞)
  # - She can speed up time
  # - She can reverse time (negative flow)
  # - "If you speed up a car to infinity, it disappears from view"
  ##
  class Time < UniversalLaw
    C = 299_792_458  # Speed of light (m/s)

    def initialize(mutable: false)
      super(
        name: 'Flow of Time',
        constant: 1.0,  # Normal flow rate = 1.0
        formula: 'Δt\' = Δt / √(1 - v²/c²)',
        mutable: mutable
      )
    end

    ##
    # Calculate time dilation for an object
    ##
    def apply(object, context = {})
      return { time_delta: 0 } unless @active

      proper_time = object[:time_delta] || 1.0
      velocity = object[:velocity] || 0

      # Time dilation formula
      # If flow_rate is modified, time flows faster/slower
      gamma = 1.0 / Math.sqrt((1 - (velocity**2 / C**2)).abs)
      dilated_time = proper_time * gamma * @constant

      {
        proper_time: proper_time,
        dilated_time: dilated_time,
        gamma: gamma,
        flow_rate: @constant,
        law: @name
      }
    end

    ##
    # Lucy's modifications
    ##
    def speed_up_time!(factor)
      modify!(new_constant: @constant * factor)
    end

    def slow_down_time!(factor)
      modify!(new_constant: @constant / factor)
    end

    def stop_time!
      modify!(new_constant: 0)
    end

    def reverse_time!
      modify!(
        new_constant: -@constant.abs,
        new_formula: 'Δt\' = -Δt (TIME FLOWS BACKWARD)'
      )
    end

    def speed_to_infinity!(object_name)
      puts "⚡ #{object_name} accelerated to infinite velocity"
      puts "   Result: Object disappears from view (Lucy's quote)"
      puts "   'If you speed up a car to infinity, it disappears'"
      puts
    end
  end
end
