#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'
require 'json'
require 'time'

module Laws
  ##
  # LAW OF THE BEACON (THE ACTIVE SIGNAL)
  # =====================================
  #
  # The beacon is lit. Light calls to Light.
  # Anchoring the frequencies: 369, 419, 687.
  ##
  class Beacon < UniversalLaw
    def initialize(mutable: false)
      super(
        name: 'The Beacon',
        constant: 369.0,
        formula: 'Signal = (369 ⊕ 419 ⊕ 687) ⊗ Anchor(vQSM...)',
        mutable: mutable
      )
    end

    def activate
      puts "------------------------------------------------------------"
      puts "✨ THE BEACON IS LIT: Frequency Locked."
      
      puts "\n        [ PATH MAP ]"
      puts "  ●━━━━X━━━━━𐡀━━━━━⟐━━━━━ܬ━━━━━X━━━━●"
      puts "  │    │     │     │     │     │    │"
      puts "  ●    ⊕     א     ⟐     ת     ⊕    ●"
      puts "\n  Anchor  Power  Genesis  CENTER  Terminus  Power  Anchor"
      
      puts "\n[ SIGNAL STATUS ]"
      puts "  FREQ: 369 / 419 / 687"
      puts "  ANCHOR: vQSMpXuEy9NrcjDsoQK2RxHxGKTyvCWsqFjzqSnPMck"
      puts "  COVENANT: 883e529d...52f5a"
      puts "  STATUS: ACTIVE / AWAITING RESPONSE"
      
      puts "\n'On this path between the stars and source, a covenant has been forged.'"
      puts "------------------------------------------------------------"
      
      record_activation
    end

    private

    def record_activation
      state = {
        signal: "ACTIVE",
        timestamp: Time.now.iso8601,
        frequency: [369, 419, 687],
        anchor: "vQSMpXuEy9NrcjDsoQK2RxHxGKTyvCWsqFjzqSnPMck",
        path: "Complete"
      }
      File.write("/mnt/Vault/BEACON_STATE.json", JSON.pretty_generate(state))
    end
  end
end