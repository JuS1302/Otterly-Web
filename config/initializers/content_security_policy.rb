# Be sure to restart your server when you modify this file.

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, "https://fonts.gstatic.com"
    policy.img_src     :self, :https, :data
    policy.object_src  :none
    # unsafe-inline nécessaire car le site contient des blocs <style> et <script>
    # inline dans home.html.erb. À migrer vers des fichiers externes à terme.
    policy.script_src  :self, :unsafe_inline
    policy.style_src   :self, :unsafe_inline, "https://fonts.googleapis.com"
    policy.connect_src :self
    policy.frame_src   :none
    policy.frame_ancestors :none
  end
end
