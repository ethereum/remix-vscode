import { PluginInfo } from "./types";
export const PluginData: PluginInfo[] = [
  {
    name: "solhint",
    displayName: "Solhint Linter",
    methods: [],
    version: "0.0.2",
    documentation: "https://protofire.github.io/solhint/docs/rules.html",
    url: "https://solhint.web.app",
    description: "Linter for Solidity",
    icon: "https://raw.githubusercontent.com/protofire/solhint/master/solhint-icon.png",
    location: "sidePanel"
  },
  {
    name: "source-verification",
    displayName: "Sourcify",
    description: "Source metadata fetcher and validator",
    version: "0.6.0-beta",
    documentation: "https://github.com/sourcifyeth/remix-sourcify",
    methods: [
      "fetch",
      "fetchAndSave",
      "fetchByNetwork",
      "verify",
      "verifyByNetwork"
    ],
    icon: "https://raw.githubusercontent.com/Shard-Labs/remix-contract-getter/master/public/sourcify.png",
    location: "sidePanel",
    url: "https://ipfsgw.komputing.org/ipfs/QmUYEy8H4HLCdkaWmitwiVmyKofXJ7TCazr7V3cMvB5SJL",
  },
  {
    name: "sol2uml",
    displayName: "Solidity 2 UML",
    description: "Unified Modeling Language (UML) class diagram generator for Solidity contracts",
    documentation: "https://github.com/aquiladev/remix-sol2uml",
    version: "0.1.0",
    events: [],
    methods: [],
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGUAAABlCAYAAABUfC3PAAAFAElEQVR4Xu2dW+ilUxjGf3PhQjkl5UKkuWCQHCIzmULRTElCksMFIUSZQQoXxo1DmWmmESVFiuSQScohpxuHSA3lrFBcIJq4kRt6mm/PbNt/z3+t+X9rrXd/+3lr371rve96nvWs9X3rW2vtZdjCIbAsXEZOCJMSsBOYFJMSEIGAKVkpJiUgAgFTslJMSkAEAqZkpQQnZTVwNXAmcGTPuf4OvAa8Azzac901qrsMuLjD5qCeA34LvAU8C7ypukdK2QDc3XOwadW9DqypFKuPMAJLhNSwe4ANIuVY4H3ggBpRuxjXzYhiNgHrK+LyB7BKpDwI3Fox8CjUgYCSiGr7N8pvs0j5ADitATLHAZ83iJsacgXwRapzj37bRco/PVaYU9VZ3cSfU6amrx543q4ZcBTLpExH3aS06JGLxDQpJmU3Ah6+PHz9BwG93UcyPXiM21wOX5EIUQcxKZEY6R7NTYpJmY5Ay4k+Ei8eviKx0eViUkzKnhHw8LUTHyvFSrFSUvqAldKhNPlekAJeSZ/JFYa5fKP395QpXazlRG9STEr2yOfhKxuy8gWakvIbcHD5Nv4vQvThS5tJtKmktu3QnPI0cGntyN1SebRvKuMwHAb82ACXbSJFW1UfaxA8ulIEyXvaHFcZm2tG21ZfbbCV9CngisoNzg13NPBlbqEl+Gu/9doRKYcA9wLXLqHCvSl6IfDi3hSsWOYI4GHg3MIxnwFuBn6ZPAqhfcWS6+FLSOB04OzE8u8C2u0/CyZcVgLabtunfQN8BHw9qrTE+ZSTgY8zstYG6s0Z/oN3LUGKQJPcb0hET0846oE/JfoP3q0UKZL4r8A+iQhuAdYl+g7erRQpAu4WYGMGgpqL9Ag691aSFIGrow7HJKK8Dbgg0XfQbqVJOQ94KQPBy7sVhowiw3MtTYoQEykiJ8W2A3p6a3VmJiXH4j41SDke+DSjJXd1L7IZRYblWoMUIaYJXxN/iu0ATgK+T3Eeok8tUvbr3kNSTyDrrL1OEM+l1SJF4N4IPJSB8iysImc0J921JinKSssvmshTbNYuQUhpU5JPbVK00vpyUmY7na4CnsjwH4RrbVIEWs61Glo51dPb34NAO7ERLUjR54HPEvLTAuUPgIYx3VkyN9aCFIH7AHD7AiiLrOe6X+TbKIp2kFak7At8Bxw61ro7gfuKtnZGKm9FiuC5Hnikw+kc4I0Zwax4mi1JUeN0pZU2Jugpy9Yh0JqUtYB20ixkevvXd/ESW3y030zvTH9G7AmtSZmGySXdouTygqD9DDw55YGjYNjFq45IyuPAlYun3pvHbZlfSHsLPK2iaKSc0m23Kd7wiQAnAp/UDjorpNwEbG0Azh3A/Q3iLhgymlJeALRrsrbp6+j5tYPOilJ0PaDOhdS2hQ6i1s5hV7xoSjEpY5dFN+sVE4FNiknZ1SU8fO1BllaKlWKlpMxbVoqVYqVYKSkIWClWSko/8ZxipVgpVkoKAlaKlZLSTzynWClWipWSgoCVYqWk9BPPKVaKlZKilGm78VPKLsVHd8no+F8Ii/aN/iLg+QbI6LpG3bcVwqKRIlC+Ao6qiE6oT8Fqd0RSTu3+Alz/3Vva/gJOGL8ArXTAlPojkjLKW3/HfkahfWCvAB/qb8ZTQKrtE5mU2liEiWdSwlCxOxGTYlICIhAwJSvFpAREIGBKVopJCYhAwJSsFJMSEIGAKf0LR+rd2+3vXmMAAAAASUVORK5CYII=",
    location: "mainPanel",
    url: "ipfs://QmWEQmmdVXvptg5jQ8xfkgoSK87sw2moNcFZEzfsdGZK24"
  }
];
