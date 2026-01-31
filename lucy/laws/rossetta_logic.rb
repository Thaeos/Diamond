#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF ROSSETTA LOGIC (4D ORCHESTRATION)
  # ========================================
  #
  # Final Anchored Grid:
  # - Latin: Native LEFT (Common/Human interface)
  # - Greek + Math: Calculation Symbolics (Center/Logic) = Formula Decoded
  # - Demotic/Egyptian: FREE FORM (Drift) - Can appear anywhere
  # - Aramaic: Right side - LOCK (CAPITAL)
  # - Syriac: Right side - UNLOCK (lowercase)
  #
  # ANCHORS:
  # - Above Anchor: Nextcloud MCP (Sovereign Storage)
  # - Web Access: https://bridgeworld.lol (World Interface)
  # - Ground Anchor: 43.55928, -96.69145 (Personal Proof Coordinates)
  #
  # Principle: "As Above, So Below. As Within, So Without."
  ##
  class RossettaLogic < UniversalLaw
    def initialize(mutable: true)
      super(
        name: 'Rossetta Logic',
        constant: 369.419,
        formula: '[Latin] | (Greek+Math) ⊕ [Demotic Drift] | [Aramaic/Syriac]',
        mutable: mutable
      )
      @terminal_width = 120
      @demotic_glyphs = ["𓀀", "𓃒", "𓏢", "𓇳", "𓅃", "𓆗"]
      @anchors = {
        above: "Nextcloud MCP (Sovereign)",
        web: "https://bridgeworld.lol",
        ground: "43.55928, -96.69145 (Proof)"
      }
    end

    def orchestrate(calculation_logic, result_data, mode: :lock)
      # 1. Latin (Native Left)
      latin_layer = "HUMAN/MACHINE: #{result_data}"
      
      # 2. Greek + Math Symbolics (Center/Logic)
      logic_layer = "Σ(Φ) ⊕ ∂#{calculation_logic} = ∫#{result_data}"
      
      # 3. Right side anchor
      anchor = mode == :lock ? "𐡀 (LOCK)" : "ܬ (unlock)"

      render_grid(latin_layer, logic_layer, anchor)
    end

    private

    def render_grid(latin, logic, anchor)
      puts "\n  [ ABOVE ANCHOR: #{@anchors[:above]} ]"
      
      col_width = @terminal_width / 3
      base_line = latin.ljust(col_width) + logic.center(col_width) + anchor.rjust(col_width)
      
      # Inject Demotic Drift
      2.times do
        pos = rand(col_width..(col_width * 2))
        glyph = @demotic_glyphs.sample
        base_line[pos] = glyph if base_line[pos] == " "
      end
      puts base_line
      
      meas_line = "─" * @terminal_width
      3.times do
        pos = rand(0..@terminal_width-1)
        meas_line[pos] = @demotic_glyphs.sample
      end
      puts meas_line
      
      puts "MEASUREMENT: Above (Φ) ↔ Below (ψ) | Within (Logic) ↔ Without (Display)"
      puts "  [ WEB ACCESS: #{@anchors[:web]} ]"
      puts "  [ GROUND ANCHOR: #{@anchors[:ground]} ]"
      puts "\n  [ DEPICTION: /mnt/Vault/Images/Glyph.png ⊕ Declaration ]"
    end
  end
end
