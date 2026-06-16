require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
# require "active_record/railtie"   # pas de base de données
# require "active_storage/engine"   # pas de stockage de fichiers
require "action_controller/railtie"
# require "action_mailer/railtie"   # pas d'envoi d'emails
# require "action_mailbox/engine"   # pas de réception d'emails
# require "action_text/engine"      # pas d'éditeur riche
require "action_view/railtie"
# require "action_cable/engine"     # pas de WebSocket
# require "rails/test_unit/railtie" # pas de tests unitaires Rails

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module OtterlyWeb
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    config.assets.enable = true
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Don't generate system test files.
    config.generators.system_tests = nil
  end
end
