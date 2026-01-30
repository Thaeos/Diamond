# Default Configuration

## ENS & Email

**Default ENS**: `theosmagic.uni.eth`  
**Default Email**: `theosmagic.uni.eth@ethermail.io`

These are the current defaults used throughout the system.

## Usage

### In Python Code
```python
from integrations import get_default_ens, get_default_email

ens = get_default_ens()  # "theosmagic.uni.eth"
email = get_default_email()  # "theosmagic.uni.eth@ethermail.io"
```

### In Environment
These are loaded from `env.txt`:
- `ENS_NAME=theosmagic.uni.eth`
- `DIGITAL_PERSONA_EMAIL=theosmagic.uni.eth@ethermail.io`

## Integration Points

- **GitHub API**: Uses default email for commits
- **Cloudflare API**: Uses default email for DNS records
- **Email Systems**: Uses default email for notifications
- **ENS Integration**: Uses default ENS for identity

---

**Status**: ✅ Defaults configured  
**Last Updated**: January 29, 2026
