module.exports = {
  name: 'American Registry for Internet Numbers (ARIN)',
  acronym: 'ARIN',
  logging: { level: 'info' },
  entityTypes: ['IPv4', 'IPv6'],
  description: 'ARIN Integration',
  defaultColor: 'dark-red',
  styles: ['./styles/arin.less'],
  block: {
    component: {
      file: './component/arin.js'
    },
    template: {
      file: './template/arin.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the ARIN integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the ARIN integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the ARIN integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the ARIN integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: '',
    /**
     * If set to false, the integration will ignore SSL errors.  This will allow the integration to connect
     * to the ARIN servers without valid SSL certificates.  Please note that we do NOT recommending setting this
     * to false in a production environment.
     */
    rejectUnauthorized: true
  },
  options: [
    {
      key: 'lookupIPv6',
      name: 'Lookup IPv6 Addresses',
      description: 'If checked, the integration will IPv6 addresses in addition to IPv4.',
      default: true,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'blocklist',
      name: 'Blocklist IPs',
      description: 'List of IPs that you never want sent to ARIN.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: false
    },
    {
      key: 'ipBlocklistRegex',
      name: 'IP Block List Regex',
      description: 'IPs that match the given regex will not be looked up (if blank, no IPs will be block listed)',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: false
    }
  ]
};
