#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'universal_law'
require 'json'
require 'net/http'
require 'uri'

module Laws
  ##
  # LAW OF THE GATEWAY (CLOUDFLARE WEB3)
  # =====================================
  # 
  # Managing the sovereign portals into the decentralized realms.
  # 1. Ethereum Gateway: system76.bridgeworld.lol
  # 2. IPFS Gateway: theos.bridgeworld.lol
  ##
  class CloudflareGateway < UniversalLaw
    def initialize(mutable: true)
      super(
        name: 'Cloudflare Gateway',
        constant: 3.33, 
        formula: 'Gateway = API(Auth) ⊕ DNS(Record) ⊕ Web3(Hostname)',
        mutable: mutable
      )
      load_config
    end

    def load_config
      env_file = "/mnt/Vault/env.txt"
      @config = {}
      if File.exist?(env_file)
        File.readlines(env_file).each do |line|
          next if line.start_with?('#') || line.strip.empty?
          if line.include?('=')
            key, val = line.split('=', 2)
            @config[key.strip] = val.strip.gsub(/^["']|["']$/, '')
          end
        end
      end
      @zone_id = "abdd28bf1af7e0d6d479c6ef016a05b8" # bridgeworld.lol
      @email = @config['PERSONAL_EMAIL']
      @api_key = @config['CLOUDFLARE_GLOBAL_API']
    end

    def sync_gateways
      puts "------------------------------------------------------------"
      puts "CLOUDFLARE GATEWAY: Synchronizing Sovereign Portals..."
      
      # 1. Check/Fix Ethereum Gateway
      manage_hostname("system76.bridgeworld.lol", "ethereum", "Sovereign Ethereum Gateway - Theos")
      
      # 2. Check/Fix IPFS Gateway
      manage_hostname("theos.bridgeworld.lol", "ipfs", "Theos IPFS Gateway", "/ipns/onboarding.ipfs.cloudflare.com")
      
      puts "\nRESULT: Gateway Synchronization Complete."
      puts "------------------------------------------------------------"
    end

    private

    def manage_hostname(name, target, description, dnslink = "")
      puts "   -> Managing #{name} (#{target})..."
      
      uri = URI.parse("https://api.cloudflare.com/client/v4/zones/#{@zone_id}/web3/hostnames")
      
      request = Net::HTTP::Get.new(uri)
      request["X-Auth-Email"] = @email
      request["X-Auth-Key"] = @api_key
      request["Content-Type"] = "application/json"
      
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }
      result = JSON.parse(response.body)
      
      if result['result']
        existing = result['result'].find { |h| h['name'] == name }
        
        if existing
          if existing['status'] == 'error'
            puts "     [!] Status: ERROR. Re-manifesting..."
            delete_hostname(existing['id'])
            create_hostname(name, target, description, dnslink)
          else
            puts "     [+] Status: #{existing['status'].upcase}. Portal Stable."
          end
        else
          puts "     [-] Portal Missing. Creating..."
          create_hostname(name, target, description, dnslink)
        end
      else
        puts "     [!] Error fetching hostnames: #{result['errors']}"
      end
    end

    def create_hostname(name, target, description, dnslink)
      uri = URI.parse("https://api.cloudflare.com/client/v4/zones/#{@zone_id}/web3/hostnames")
      request = Net::HTTP::Post.new(uri)
      request["X-Auth-Email"] = @email
      request["X-Auth-Key"] = @api_key
      request["Content-Type"] = "application/json"
      
      payload = {
        name: name,
        target: target,
        description: description
      }
      payload[:dnslink] = dnslink unless dnslink.empty?
      
      request.body = payload.to_json
      
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }
      res_data = JSON.parse(response.body)
      
      if res_data['success']
        puts "     [+] Created #{name}."
      else
        puts "     [!] Creation failed: #{res_data['errors']}"
      end
    end

    def delete_hostname(id)
      uri = URI.parse("https://api.cloudflare.com/client/v4/zones/#{@zone_id}/web3/hostnames/#{id}")
      request = Net::HTTP::Delete.new(uri)
      request["X-Auth-Email"] = @email
      request["X-Auth-Key"] = @api_key
      request["Content-Type"] = "application/json"
      
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }
      res_data = JSON.parse(response.body)
      
      if res_data['success']
        puts "     [-] Removed stagnant portal."
      else
        puts "     [!] Removal failed: #{res_data['errors']}"
      end
    end
  end
end