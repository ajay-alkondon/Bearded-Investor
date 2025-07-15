import { createReduxStore, register } from '@wordpress/data';

import { StoreKey as CurriculumKey, StoreConfig as Curriculum } from "./curriculum";
const curriculumStore = createReduxStore(CurriculumKey, Curriculum);
register(curriculumStore);

import { StoreKey as SettingsKey, StoreConfig as Settings } from "./settings";
const settingsStore = createReduxStore(SettingsKey, Settings);
register(settingsStore);

import { StoreKey as CertificatesKey, StoreConfig as Certificates } from "./certificates";
const certificatesStore = createReduxStore(CertificatesKey, Certificates);
register(certificatesStore);

import { StoreKey as PricingKey, StoreConfig as Pricing } from "./pricing";
const pricingStore = createReduxStore(PricingKey, Pricing);
register(pricingStore);

import { StoreKey as ResourcesKey, StoreConfig as Resources } from "./resources";
const resourcesStore = createReduxStore(ResourcesKey, Resources);
register(resourcesStore);