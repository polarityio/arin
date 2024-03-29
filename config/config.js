module.exports = {
  name: 'American Registry for Internet Numbers (ARIN)',
  acronym: 'ARIN',
  logging: { level: 'info' },
  entityTypes: ['IPv4', 'IPv6'],
  description: 'ARIN Integration',
  defaultColor: 'light-gray',
  styles: ['./styles/arin.less'],
  block: {
    component: {
      file: './component/block.js'
    },
    template: {
      file: './template/block.hbs'
    }
  },
  summary: {
    component: {
      file: './component/summary.js'
    },
    template: {
      file: './template/summary.hbs'
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
    proxy: ""
  },
  options: [
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
    },
    {
      key: 'allRegistries',
      name: 'Display Regional Registry Ownership Information',
      description:
          'If checked, the integration will return a result when the IP address is controlled by one of the non-ARIN regional Internet registries (i.e., RIPE, APNIC, AFRINIC, LACNIC) as well as IANA.  If unchecked, only IP addresses controlled by ARIN will be returned.',
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: false
    },
    {
      key: 'maxConcurrent',
      name: 'Max Concurrent Requests',
      description:
        'Maximum number of concurrent requests.  Integration must be restarted after changing this option. Defaults to 3.',
      default: 3,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'minTime',
      name: 'Minimum Time Between Lookups',
      description:
        'Minimum amount of time in milliseconds between lookups (defaults to 250).  Integration must be restarted after changing this option. Defaults to 250.',
      default: 250,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
