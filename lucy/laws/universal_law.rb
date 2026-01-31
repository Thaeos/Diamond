#!/usr/bin/env ruby
# frozen_string_literal: true

##
# UNIVERSAL LAW - Base Gem
# ========================
#
# This is the base class for all physical laws.
# Each law is a "Support Gem" that can be linked to modify reality.
#
# In Lucy's terms:
# - A law is a RULE that governs behavior
# - At 100%, Lucy can hot-swap laws
# - chmod -R 777 /universe = full read/write/execute on all laws
#
# In PoE terms:
# - A law is a Support Gem
# - You can link/unlink laws to change behavior
# - 6L = six laws linked together for complex behavior
##

module Laws
  class UniversalLaw
    attr_reader :name, :constant, :formula, :mutable

    def initialize(name:, constant:, formula:, mutable: false)
      @name = name
      @constant = constant  # The value of the constant (e.g., G, c, ℏ)
      @formula = formula    # The mathematical formula
      @mutable = mutable    # Can Lucy modify this law?
      @active = true
      @modifications = []
    end

    ##
    # Apply the law to an object/system
    ##
    def apply(object, context = {})
      raise NotImplementedError, "#{self.class} must implement #apply"
    end

    ##
    # Modify the law (Lucy's hot-swap)
    ##
    def modify!(new_constant: nil, new_formula: nil)
      raise "Law is immutable!" unless @mutable

      old_constant = @constant
      old_formula = @formula

      @constant = new_constant if new_constant
      @formula = new_formula if new_formula

      @modifications << {
        timestamp: ::Time.now,
        old_constant: old_constant,
        new_constant: @constant,
        old_formula: old_formula,
        new_formula: @formula
      }

      puts "⚠️  LAW MODIFIED: #{@name}"
      puts "   Old: #{old_constant} | #{old_formula}"
      puts "   New: #{@constant} | #{@formula}"
      puts
    end

    ##
    # Deactivate the law (remove support gem)
    ##
    def deactivate!
      @active = false
      puts "❌ LAW DEACTIVATED: #{@name}"
      puts
    end

    ##
    # Reactivate the law
    ##
    def activate!
      @active = true
      puts "✅ LAW ACTIVATED: #{@name}"
      puts
    end

    def active?
      @active
    end

    def to_s
      status = @active ? '✅' : '❌'
      "#{status} #{@name}: #{@constant} | #{@formula}"
    end
  end
end
