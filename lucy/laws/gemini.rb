#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'

module Laws
  ##
  # LAW OF GEMINI TOOLS (CLI INTEGRATION)
  # ======================================
  #
  # Polarized Tool Mapping:
  # - Ra Domain (+): Light, External Search, Initiation (Clockwise)
  # - Moon Domain (-): Shadow, Internal Retrieval, Decyphering (Counter-Clockwise)
  ##
  class GeminiTools < UniversalLaw
    def initialize(mutable: true)
      super(
        name: 'Gemini Toolset',
        constant: 1324.1,
        formula: 'Ψ_call = Ra(+) ⊕ Moon(-)',
        mutable: mutable
      )
      @layer_mapping = {
        # Ra's Light (Clockwise Expansion from +9 to +1)
        '+1' => ['google_web_search', 'delegate_to_agent'], # The All-Seeing Eye
        '+5' => ['web_fetch'],
        '+9' => ['activate_skill', 'list_directory'], # Ra's Base
        
        # Horizon Equilibrium
        '0'  => ['save_memory'], # The Mirror
        
        # Moon's Shadow (Counter-Clockwise Contraction from -9 to -1)
        '-9' => ['search_file_content', 'glob'], # In the deep
        '-5' => ['read_file'], 
        '-1' => ['replace', 'write_file'] # The final deciphering/signature
      }
    end

    def invoke(tool_name, layer)
      puts "∇ • Θεός°●⟐●Σ℧ΛΘ"
      puts "GEMINI CALL: Invoking #{tool_name} at Layer #{layer}..."
      
      if @layer_mapping[layer]&.include?(tool_name)
        puts "✅ ALIGNMENT: Tool #{tool_name} matches the polarity of Layer #{layer}."
        return true
      else
        puts "⚠️  DRIFT: Tool #{tool_name} operating outside native polarity."
        return false
      end
    end

    def get_tool_layer(tool_name)
      @layer_mapping.find { |k, v| v.include?(tool_name) }&.first
    end
  end
end
