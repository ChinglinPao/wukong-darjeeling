#ifndef WKPF_LINKSH
#define WKPF_LINKSH

#include "wkcomm.h"
#include "program_mem.h"

extern bool wkpf_does_property_need_initialisation_pull(uint8_t port_number, uint8_t property_number);
extern uint8_t wkpf_propagate_dirty_properties();
extern uint8_t wkpf_get_node_and_port_for_component(uint16_t component_id, address_t *node_id, uint8_t *port_number);

extern bool wkpf_node_is_leader(uint16_t component_id, address_t node_id);

uint8_t wkpf_load_links(dj_di_pointer links);
uint8_t wkpf_load_component_to_wuobject_map(dj_di_pointer map);
uint8_t wkpf_create_local_wuobjects_from_app_tables();
uint8_t wkpf_process_initvalues_list(dj_di_pointer initvalues);

#endif // WKPF_LINKSH
