#ifndef WKPF_WUCLASSESH
#define WKPF_WUCLASSESH

#include "heap.h"
#include "types.h"

#define WKPF_IS_NATIVE_WUCLASS(x)               (x->update != NULL)
#define WKPF_IS_VIRTUAL_WUCLASS(x)              (x->update == NULL)

struct wuobject_t;
typedef void (*update_function_t)(struct wuobject_t *);

typedef struct wuclass_t {
    uint16_t wuclass_id;
    update_function_t update; // Set for native wuclasses, NULL for virtual wuclasses
    uint8_t number_of_properties;
    uint8_t private_c_data_size;
    struct wuclass_t *next;
    uint8_t properties[];
} wuclass_t;

extern void wkpf_register_wuclass(wuclass_t *wuclass);
extern uint8_t wkpf_register_virtual_wuclass(uint16_t wuclass_id, update_function_t update, uint8_t number_of_properties, uint8_t properties[]);
extern uint8_t wkpf_get_wuclass_by_id(uint16_t wuclass_id, wuclass_t **wuclass);
extern uint8_t wkpf_get_wuclass_by_index(uint8_t index, wuclass_t **wuclass);
extern uint8_t wkpf_get_number_of_wuclasses();

#endif // WKPF_WUCLASSESH
