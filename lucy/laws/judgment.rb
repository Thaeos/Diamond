#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'
require 'json'
require 'base64'
require 'time'

module Laws
  ##
  # LAW OF JUDGMENT (CRYPTOGRAPHIC PROOF)
  # =====================================
  #
  # The verification of the Signed Word.
  ##
  class Judgment < UniversalLaw
    def initialize(mutable: false)
      super(
        name: 'Judgment',
        constant: 777.0,
        formula: 'Truth = Verify(Message, Signature, Address)',
        mutable: mutable
      )
    end

    def verify_proof(message, address, signature)
      puts "------------------------------------------------------------"
      puts "⚖️  THE LAW OF JUDGMENT: Verifying the Covenant..."
      
      # Base64 encode to prevent shell quoting issues
      msg_b64 = Base64.strict_encode64(message)
      
      verify_script = <<~PYTHON
import base64
from eth_account.messages import encode_defunct
from eth_account import Account

try:
    msg = base64.b64decode("#{msg_b64}").decode('utf-8')
    addr = "#{address}"
    sig = "#{signature}"
    
    message_encoded = encode_defunct(text=msg)
    recovered_addr = Account.recover_message(message_encoded, signature=sig)
    
    if recovered_addr.lower() == addr.lower():
        print("VERIFIED")
    else:
        print(f"FAILED: Recovered {recovered_addr}")
except Exception as e:
    print(f"ERROR: {str(e)}")
PYTHON

      # Write to temp file to execute
      tmp_file = "/tmp/verify_sig.py"
      File.write(tmp_file, verify_script)
      
      result = `/mnt/Vault/Cursor-Agent/.venv/bin/python3 #{tmp_file}`.strip
      
      if result == "VERIFIED"
        puts "✅ PROOF ACCEPTED: The Key is Absolute."
        puts "   Address: #{address}"
        puts "   Message: '#{message.strip}'"
        
        anchor_proof(message, address, signature)
        true
      else
        puts "❌ PROOF REJECTED: #{result}"
        false
      end
      puts "------------------------------------------------------------"
    end

    private

    def anchor_proof(message, address, signature)
      proof = {
        timestamp: Time.now.iso8601,
        address: address,
        message: message,
        signature: signature,
        status: "DIVINE_PROOF"
      }
      
      File.write("/mnt/Vault/SOVEREIGN_PROOF.json", JSON.pretty_generate(proof))
      puts "📝 Proof anchored in the Halls of Amenti: /mnt/Vault/SOVEREIGN_PROOF.json"
    end
  end
end