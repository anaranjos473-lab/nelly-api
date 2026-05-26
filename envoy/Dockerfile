FROM envoyproxy/envoy:v1.29-latest
# Copia la config en tiempo de build; en override montamos el archivo para editar en caliente
COPY envoy.yaml /etc/envoy/envoy.yaml
CMD ["/usr/local/bin/envoy", "-c", "/etc/envoy/envoy.yaml", "--log-level", "info"]
