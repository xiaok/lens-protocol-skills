# Metadata Reference

Compact lookup for `@lens-protocol/metadata` v2.1.0 builders, types, and enums.

Builder functions set `$schema` and `id` for you; `id` defaults to a UUID. Branded types such as `URI`, `Markdown`, `Tag`, and `Locale` can be passed as plain strings to the builders.

For `attributes[].type`, use `MetadataAttributeType.STRING | DATE | BOOLEAN | NUMBER | JSON` instead of hand-written `"String"`-style literals.

## Entity Metadata Builders

### `account(options)`

```ts
account({
  name?: string,               // display name
  bio?: string,                // markdown bio
  picture?: string,            // URI
  coverPicture?: string,       // URI
  attributes?: MetadataAttribute[],
})
```

### `app(options)`

```ts
app({
  name: string,                // REQUIRED
  url: string,                 // REQUIRED - URI
  developer: string,           // REQUIRED
  platforms: Platform[],       // REQUIRED - "web" | "ios" | "android"
  tagline?: string,
  description?: string,        // markdown
  logo?: string,               // URI
  termsOfService?: string,     // URI
  privacyPolicy?: string,      // URI
})
```

### `feed(options)`

```ts
feed({
  name: string,                // REQUIRED
  description?: string,
})
```

### `graph(options)`

```ts
graph({
  name: string,                // REQUIRED
  description?: string,
})
```

### `group(options)`

```ts
group({
  name: string,                // REQUIRED - 1-50 chars, alphanumeric + hyphen
  description?: string,
  icon?: string,               // URI
  coverPicture?: string,       // URI
})
```

### `namespace(options)`

```ts
namespace({
  description?: string,
  collection?: {               // EIP-7572 collection metadata
    name: string,
    symbol?: string,
    description?: string,
    image?: string,
    banner_image?: string,
    featured_image?: string,
    external_link?: string,
    collaborators?: string[],  // EVM addresses
  },
})
```

### `sponsorship(options)`

```ts
sponsorship({
  name: string,                // REQUIRED
  description?: string,
})
```

---

## Post Content Builders

Most post builders accept these optional fields:

```ts
{
  id?: string,                       // defaults to UUID
  locale?: string,                   // defaults to "en"
  attributes?: MetadataAttribute[],
  tags?: string[],                   // max 50 chars each, lowercased
  contentWarning?: ContentWarning,   // "NSFW" | "SENSITIVE" | "SPOILER"
  nft?: NftDetails,                  // optional NFT interop layer
}
```

### `textOnly(options)`

```ts
textOnly({
  content: string,             // REQUIRED - markdown
})
```

### `image(options)`

```ts
image({
  image: MediaImage,           // REQUIRED - { item, type, altTag?, license? }
  title?: string,
  content?: string,            // markdown
  attachments?: AnyMedia[],
})
```

### `video(options)`

```ts
video({
  video: MediaVideo,           // REQUIRED - { item, type, cover?, duration?, altTag?, license? }
  title?: string,
  content?: string,            // markdown
  attachments?: AnyMedia[],
})
```

### `shortVideo(options)`

Same as `video()` but sets `mainContentFocus` to `SHORT_VIDEO`.

### `audio(options)`

```ts
audio({
  audio: MediaAudio,           // REQUIRED - { item, type, cover?, duration?, artist?, genre?, kind?, ... }
  title?: string,
  content?: string,            // markdown
  attachments?: AnyMedia[],
})
```

### `article(options)`

```ts
article({
  content: string,             // REQUIRED - markdown (long-form)
  title?: string,
  attachments?: AnyMedia[],
})
```

### `story(options)`

```ts
story({
  asset: AnyMedia,             // REQUIRED - single media asset (image, video, or audio)
  content?: string,
  // NOTE: no attachments field
})
```

### `embed(options)`

```ts
embed({
  embed: string,               // REQUIRED - URI of embedded content
  content?: string,
  attachments?: AnyMedia[],
})
```

### `link(options)`

```ts
link({
  sharingLink: string,         // REQUIRED - URI
  content?: string,
  attachments?: AnyMedia[],
})
```

### `event(options)`

```ts
event({
  location: string,            // REQUIRED - URI or free text
  startsAt: string,            // REQUIRED - ISO 8601 DateTime
  endsAt: string,              // REQUIRED - ISO 8601 DateTime
  title?: string,
  position?: string,           // GeoURI - use geoUri(lat, lng)
  address?: PhysicalAddress,   // { locality, country, streetAddress?, region?, postalCode? }
  schedulingAdjustments?: { timezoneId, timezoneOffset },
  links?: string[],            // URIs
  content?: string,
  attachments?: AnyMedia[],
})
```

### `liveStream(options)` (note: camelCase)

```ts
liveStream({
  startsAt: string,            // REQUIRED - ISO 8601
  playbackUrl: string,         // REQUIRED - URI
  liveUrl: string,             // REQUIRED - URI
  title?: string,
  endsAt?: string,
  checkLiveAPI?: string,       // URI for live status polling
  content?: string,
  attachments?: AnyMedia[],
})
```

### `mint(options)`

```ts
mint({
  mintLink: string,            // REQUIRED - URI (e.g. OpenSea/Zora URL)
  content?: string,
  attachments?: AnyMedia[],
})
```

### `space(options)`

```ts
space({
  title: string,               // REQUIRED
  link: string,                // REQUIRED - URI (join link)
  startsAt: string,            // REQUIRED - ISO 8601
  content?: string,
  attachments?: AnyMedia[],
})
```

### `transaction(options)`

```ts
transaction({
  txHash: string,              // REQUIRED
  type: MetadataTransactionType, // "ERC721" | "ERC20" | "OTHER"
  chainId: number,             // REQUIRED
  content?: string,
  attachments?: AnyMedia[],
})
```

---

## Action / Rule Metadata Builders

Use these for custom on-chain extensibility, not for ordinary posts or account profiles.

### `action(options)`

Creates metadata for a custom action contract. Include `name`, `description`, `authors`, `source`, and parameter descriptors for `configure` / `execute` when the action needs them.

### Rule metadata builders

- `feedRule(options)`
- `followRule(options)`
- `graphRule(options)`
- `groupRule(options)`
- `namespaceRule(options)`
- `postRule(options)`

These builders describe custom rule contracts and their parameter surfaces. Use them when the product deploys or integrates non-default rules and the implementation needs to encode rule params correctly.

### `checkingIn(options)`

```ts
checkingIn({
  location: string,            // REQUIRED - free text
  position?: string,           // GeoURI
  address?: PhysicalAddress,
  content?: string,
  attachments?: AnyMedia[],
})
```

### `threeD(options)`

```ts
threeD({
  assets: ThreeDAsset[],       // REQUIRED - { uri, playerUrl, format, zipPath?, license? }
  content?: string,
  attachments?: AnyMedia[],
})
```

---

## Media Types

### MediaImage

```ts
{
  item: string,                    // REQUIRED - URI
  type: MediaImageMimeType,        // REQUIRED
  altTag?: string,
  license?: MetadataLicenseType,
  attributes?: MetadataAttribute[],
}
```

### MediaVideo

```ts
{
  item: string,                    // REQUIRED - URI
  type: MediaVideoMimeType,        // REQUIRED
  cover?: string,                  // URI - thumbnail
  duration?: number,               // seconds
  altTag?: string,
  license?: MetadataLicenseType,
  attributes?: MetadataAttribute[],
}
```

### MediaAudio

```ts
{
  item: string,                    // REQUIRED - URI
  type: MediaAudioMimeType,        // REQUIRED
  cover?: string,                  // URI
  duration?: number,               // seconds
  artist?: string,
  genre?: string,
  recordLabel?: string,
  credits?: string,
  lyrics?: string,                 // URI
  kind?: MediaAudioKind,           // "MUSIC" | "PODCAST" | "AUDIOBOOK" | ...
  license?: MetadataLicenseType,
  attributes?: MetadataAttribute[],
}
```

---

## Enums

### MediaImageMimeType

`AVIF`, `BMP`, `GIF`, `HEIC`, `JPEG`, `PNG`, `SVG_XML`, `TIFF`, `WEBP`, `X_MS_BMP`

### MediaVideoMimeType

`GLTF`, `GLTF_BINARY`, `M4V`, `MOV`, `MP4`, `MPEG`, `OGG`, `OGV`, `QUICKTIME`, `WEBM`

### MediaAudioMimeType

`WAV`, `WAV_VND`, `MP3`, `OGG_AUDIO`, `MP4_AUDIO`, `AAC`, `WEBM_AUDIO`, `FLAC`

### MediaAudioKind

`MUSIC`, `PODCAST`, `AUDIOBOOK`, `VOICE_NOTE`, `SOUND`, `OTHER`

### MetadataLicenseType

`CCO`, `CC_BY`, `CC_BY_ND`, `CC_BY_NC`, plus 28 TBNL variants (Token-Bound NFT License)

### ContentWarning

`NSFW`, `SENSITIVE`, `SPOILER`

### MetadataAttributeType

`BOOLEAN`, `DATE`, `NUMBER`, `STRING`, `JSON`

### MetadataTransactionType

`ERC721`, `ERC20`, `OTHER`

### PostMainFocus

`TEXT_ONLY`, `IMAGE`, `VIDEO`, `SHORT_VIDEO`, `AUDIO`, `ARTICLE`, `LINK`, `EMBED`, `CHECKING_IN`, `EVENT`, `MINT`, `TRANSACTION`, `LIVESTREAM`, `THREE_D (3D)`, `STORY`, `SPACE`

### Platform

`WEB ("web")`, `IOS ("ios")`, `ANDROID ("android")`

### ThreeDFormat

`GLTF ("gLTF/GLB")`, `FBX`, `VRM`, `OBJ`

---

## MetadataAttribute Construction

There is no dedicated helper for attributes; construct them directly:

```ts
const attr: MetadataAttribute = {
  type: MetadataAttributeType.STRING,
  key: "website",
  value: "https://example.com",
};

// Boolean
{ type: MetadataAttributeType.BOOLEAN, key: "verified", value: "true" }

// Number
{ type: MetadataAttributeType.NUMBER, key: "age", value: "25" }

// Date
{ type: MetadataAttributeType.DATE, key: "birthday", value: "1990-01-01T00:00:00.000Z" }

// JSON
{ type: MetadataAttributeType.JSON, key: "config", value: '{"theme":"dark"}' }
```

---

## Rule Metadata Builders

For custom rule smart contracts, each builder needs `name`, `description`, `authors`, `source`, and the process-specific `ContractKeyValuePairDescriptor[]` arrays.

| Builder | Process Params |
|---------|---------------|
| `feedRule()` | configureParams, processCreatePostParams, processEditPostParams, processRemovePostParams, processPostRuleChangesParams |
| `followRule()` | configureParams, processFollowParams |
| `graphRule()` | configureParams, processFollowParams, processUnfollowParams, processFollowRuleChangesParams |
| `groupRule()` | configureParams, processAdditionParams, processRemovalParams, processJoiningParams, processLeavingParams |
| `namespaceRule()` | configureParams, processCreationParams, processRemovalParams, processAssigningParams, processUnassigningParams |
| `postRule()` | configureParams, processCreatePostParams, processEditPostParams |

### `action(options)` — Action metadata

```ts
action({
  name: string,                // REQUIRED
  description: string,         // REQUIRED - markdown
  authors: string[],           // REQUIRED - emails
  source: string,              // REQUIRED - URI
  configureParams?: ContractKeyValuePairDescriptor[],
  executeParams?: ContractKeyValuePairDescriptor[],
  setDisabledParams?: ContractKeyValuePairDescriptor[],
})
```

### ContractKeyValuePairDescriptor

```ts
{
  key: string,                 // keccak256 hash of param name (Bytes32)
  name: string,                // human-readable name
  type: string,                // human-readable ABI type (e.g. "address", "uint256")
}
```

---

## Helper Functions

| Function | Description |
|----------|-------------|
| `toLocale(s)` | Brand string as `Locale` |
| `toMarkdown(s)` | Brand string as `Markdown` |
| `toTag(s)` | Brand string as `Tag` |
| `toDateTime(s)` | Brand string as `DateTime` |
| `toEvmAddress(s)` | Brand string as `EvmAddress` |
| `toChainId(n)` | Brand number as `ChainId` |
| `geoUri(lat, lng)` | Create GeoURI string |
| `geoPoint(geoUri)` | Parse GeoURI to `{ lat, lng }` |
