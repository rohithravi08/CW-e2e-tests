# Test Cases

---

## UI Tests

| ID | Scenario | Test Steps |
|----|----------|------------|
| UI-01 | Search for "train" and verify second lot details | **Given** the user is on the Catawiki homepage<br>**When** they type "train" in the search field and click the magnifier button<br>**Then** the search results page opens with "train" in the URL<br>**When** they click the second lot card<br>**Then** the lot page opens and the lot name, favourites count and current bid are printed to the console |
| UI-02 | Search results contain multiple lots with titles | **Given** the user is on the Catawiki homepage<br>**When** they search for "train"<br>**Then** the search results page contains more than one lot card<br>**And** the first lot card has a non-empty title |
| UI-03 | Different search keywords return relevant results | **Given** the user is on the Catawiki homepage<br>**When** they search for "stamp"<br>**Then** the search results page contains at least one lot<br>**And** the first lot has a non-empty title |
| UI-04 | Clicking the first lot opens a valid lot page | **Given** the user is on the search results page for "train"<br>**When** they click the first lot card<br>**Then** the lot page opens with a URL containing `/l/`<br>**And** the lot name is displayed |
| UI-05 | Lot page title matches the card title in search results | **Given** the user is on the search results page for "train"<br>**When** they click the second lot card<br>**Then** the lot page title contains the first 30 characters of the card title shown in search results |
| UI-06 | Browser back button returns to search results | **Given** the user has navigated from search results to a lot page<br>**When** they click the browser back button<br>**Then** the search results page is displayed again with `/s?` in the URL |

---

## API Tests

### Collections API — `GET /collections/api/v1/collections/related/brand`

| ID | Scenario | Test Steps |
|----|----------|------------|
| COL-01 | Endpoint is reachable | **Given** the collections API is available<br>**When** a GET request is sent with `query=?q=train&locale=en`<br>**Then** the response status is `200` |
| COL-02 | Response contains a collections array | **Given** the API returns a 200 response<br>**When** the response body is parsed<br>**Then** the body contains a `collections` key with a non-empty array |
| COL-03 | Each collection has all required fields | **Given** the collections array is returned<br>**When** each item is inspected<br>**Then** every collection contains: `id`, `title`, `description`, `start_date`, `url`, `color`, `title_color`, `cta_text`, `categories`, `images`, `lot_count`, `tags`, `seo` |
| COL-04 | Each collection ID is a positive integer | **Given** the collections array is returned<br>**When** each item's `id` is checked<br>**Then** all IDs are positive integers |
| COL-05 | Each collection title is a non-empty string | **Given** the collections array is returned<br>**When** each item's `title` is checked<br>**Then** all titles are non-empty strings |
| COL-06 | Each collection URL points to catawiki.com | **Given** the collections array is returned<br>**When** each item's `url` is checked<br>**Then** all URLs contain `catawiki.com` and match the pattern `/en/x/{id}` |
| COL-07 | Each collection color values are valid hex | **Given** the collections array is returned<br>**When** each item's `color` and `title_color` are checked<br>**Then** all values match the `#RRGGBB` hex pattern |
| COL-08 | Each collection lot_count is a positive integer | **Given** the collections array is returned<br>**When** each item's `lot_count` is checked<br>**Then** all lot counts are positive integers |
| COL-09 | Each collection categories is a non-empty array of integers | **Given** the collections array is returned<br>**When** each item's `categories` is checked<br>**Then** all category arrays are non-empty and contain only integers |
| COL-10 | Each collection image has a URL and valid orientation | **Given** the collections array is returned<br>**When** each image in each collection is inspected<br>**Then** every image has a `url` string and an `orientation` of either `portrait` or `landscape` |
| COL-11 | First collection image URL is reachable | **Given** the collections array is returned<br>**When** a HEAD request is sent to the first image URL<br>**Then** the response status is `200`, `301`, or `302` |
| COL-12 | The seo field is a boolean | **Given** the collections array is returned<br>**When** each item's `seo` field is checked<br>**Then** all `seo` values are booleans |
| COL-13 | start_date is a valid ISO 8601 date | **Given** the collections array is returned<br>**When** each item's `start_date` is parsed<br>**Then** all dates are valid ISO 8601 strings |
| COL-14 | cta_text contains an object count number | **Given** the collections array is returned<br>**When** each item's `cta_text` is checked<br>**Then** all values contain at least one digit |
| COL-15 | Response time is under 2 seconds | **Given** the collections API is available<br>**When** a GET request is sent<br>**Then** the full response is received in under 2000ms |
| COL-16 | locale=nl returns a valid response | **Given** the collections API is available<br>**When** a GET request is sent with `locale=nl`<br>**Then** the response is `200` and contains a `collections` array |
| COL-17 | Different query keyword returns a valid response | **Given** the collections API is available<br>**When** a GET request is sent with `query=?q=stamp`<br>**Then** the response is `200` and contains a `collections` array |

---

### Lot Navigation API — `GET /buyer/api/v3/lots/{id}/navigation`

| ID | Scenario | Test Steps |
|----|----------|------------|
| NAV-01 | Endpoint returns 200 for a valid lot | **Given** a known lot ID exists<br>**When** a GET request is sent<br>**Then** the response status is `200` |
| NAV-02 | Response contains all required fields | **Given** the API returns a 200 response<br>**When** the response body is parsed<br>**Then** the body contains: `source`, `previous_lot_id`, `next_lot_id`, `current_position`, `total_lots` |
| NAV-03 | source is a non-empty string | **Given** the API returns a valid response<br>**When** the `source` field is checked<br>**Then** it is a non-empty string |
| NAV-04 | previous_lot_id is a positive integer or null | **Given** the API returns a valid response<br>**When** the `previous_lot_id` field is checked<br>**Then** it is either `null` (first lot) or a positive integer |
| NAV-05 | next_lot_id is a positive integer or null | **Given** the API returns a valid response<br>**When** the `next_lot_id` field is checked<br>**Then** it is either `null` (last lot) or a positive integer |
| NAV-06 | current_position is a positive integer | **Given** the API returns a valid response<br>**When** the `current_position` field is checked<br>**Then** it is a positive integer greater than or equal to 1 |
| NAV-07 | total_lots is a positive integer | **Given** the API returns a valid response<br>**When** the `total_lots` field is checked<br>**Then** it is a positive integer |
| NAV-08 | current_position is within bounds | **Given** the API returns a valid response<br>**When** `current_position` is compared against `total_lots`<br>**Then** `1 ≤ current_position ≤ total_lots` |
| NAV-09 | previous and next lot IDs are different | **Given** the API returns a valid response<br>**When** `previous_lot_id` and `next_lot_id` are compared<br>**Then** the two values are not equal when both are non-null |
| NAV-10 | previous and next IDs differ from the requested lot | **Given** the API returns a valid response<br>**When** `previous_lot_id` and `next_lot_id` are compared to the requested lot ID<br>**Then** neither value equals the requested lot ID |
| NAV-11 | First lot in auction has null previous_lot_id | **Given** a lot at position 1 is requested<br>**When** the `previous_lot_id` field is checked<br>**Then** it is `null` |
| NAV-12 | Last lot in auction has null next_lot_id | **Given** a lot at the last position is requested<br>**When** the `next_lot_id` field is checked<br>**Then** it is `null` |
| NAV-13 | Non-existent lot returns 404 | **Given** an invalid lot ID is used<br>**When** a GET request is sent<br>**Then** the response status is `404` |
| NAV-14 | Response time is under 1 second | **Given** the navigation API is available<br>**When** a GET request is sent<br>**Then** the full response is received in under 1000ms |
| NAV-15 | Previous lot's navigation points back to current lot | **Given** a lot with a previous neighbour is requested<br>**When** the navigation API is called for the previous lot<br>**Then** its `next_lot_id` equals the original lot ID<br>**And** its `current_position` is one less than the original |
| NAV-16 | Next lot's navigation points back to current lot | **Given** a lot with a next neighbour is requested<br>**When** the navigation API is called for the next lot<br>**Then** its `previous_lot_id` equals the original lot ID<br>**And** its `current_position` is one greater than the original |

---

### Lot Bids API — `GET /buyer/api/v3/lots/{id}/bids`

| ID | Scenario | Test Steps |
|----|----------|------------|
| BIDS-01 | Endpoint returns 200 for a valid lot | **Given** a known lot ID exists<br>**When** a GET request is sent with `currency_code=EUR&per_page=200`<br>**Then** the response status is `200` |
| BIDS-02 | Response contains bids array and meta object | **Given** the API returns a 200 response<br>**When** the response body is parsed<br>**Then** the body contains a `bids` array and a `meta` object |
| BIDS-03 | Non-existent lot returns 200 with null bids | **Given** an invalid lot ID is used<br>**When** a GET request is sent<br>**Then** the response status is `200` and `bids` is `null` or an empty array |
| BIDS-04 | Each bid has all required fields | **Given** the bids array is returned<br>**When** each bid is inspected<br>**Then** every bid contains: `id`, `amount`, `currency_code`, `bidder`, `from_order`, `explanation_type`, `created_at` |
| BIDS-05 | Each bid ID is a unique positive integer | **Given** the bids array is returned<br>**When** all bid IDs are checked<br>**Then** all IDs are positive integers with no duplicates |
| BIDS-06 | Each bid amount is a positive number | **Given** the bids array is returned<br>**When** each bid's `amount` is checked<br>**Then** all amounts are positive numbers |
| BIDS-07 | All bid amounts are unique | **Given** the bids array is returned<br>**When** all amounts are compared<br>**Then** no two bids share the same amount |
| BIDS-08 | Each bid currency matches the requested currency | **Given** a request is sent with `currency_code=EUR`<br>**When** each bid's `currency_code` is checked<br>**Then** all values equal `EUR` |
| BIDS-09 | from_order is a boolean | **Given** the bids array is returned<br>**When** each bid's `from_order` is checked<br>**Then** all values are booleans |
| BIDS-10 | explanation_type is null or a string | **Given** the bids array is returned<br>**When** each bid's `explanation_type` is checked<br>**Then** all values are either `null` or a string |
| BIDS-11 | created_at is a valid ISO 8601 datetime | **Given** the bids array is returned<br>**When** each bid's `created_at` is parsed<br>**Then** all values match `YYYY-MM-DDTHH:MM:SSZ` and are parseable |
| BIDS-12 | Bids are sorted by amount descending | **Given** the bids array is returned<br>**When** amounts are compared in sequence<br>**Then** each bid's amount is greater than or equal to the next |
| BIDS-13 | Bids are sorted by created_at descending | **Given** the bids array is returned<br>**When** timestamps are compared in sequence<br>**Then** each bid's timestamp is greater than or equal to the next |
| BIDS-14 | Each bidder has all required fields | **Given** the bids array is returned<br>**When** each bidder object is inspected<br>**Then** every bidder contains: `name`, `token`, `total_bids`, `country` |
| BIDS-15 | Bidder name matches "Bidder NNNN" pattern | **Given** the bids array is returned<br>**When** each bidder's `name` is checked<br>**Then** all names match the pattern `Bidder {number}` |
| BIDS-16 | Bidder token is a 40-character hex string | **Given** the bids array is returned<br>**When** each bidder's `token` is checked<br>**Then** all tokens are 40-character lowercase hex strings |
| BIDS-17 | Bidder total_bids is a positive integer | **Given** the bids array is returned<br>**When** each bidder's `total_bids` is checked<br>**Then** all values are positive integers |
| BIDS-18 | Country code is a 2-letter lowercase string | **Given** the bids array is returned<br>**When** each bidder's `country.code` is checked<br>**Then** all codes match the 2-letter lowercase format |
| BIDS-19 | Country flag URLs are valid CDN URLs | **Given** the bids array is returned<br>**When** each bidder's flag URLs are checked<br>**Then** both `flag_svg_url` and `flag_png_url` point to `cdn.catawiki.net` |
| BIDS-20 | Flag URL contains the correct country code | **Given** the bids array is returned<br>**When** flag URLs are matched against the bidder's country code<br>**Then** each flag URL contains the corresponding country code |
| BIDS-21 | meta.per_page matches the requested parameter | **Given** a request is sent with `per_page=200`<br>**When** the `meta.per_page` field is checked<br>**Then** it equals `200` |
| BIDS-22 | meta.page defaults to 1 | **Given** no page parameter is provided<br>**When** the `meta.page` field is checked<br>**Then** it equals `1` |
| BIDS-23 | meta.total is a non-negative integer | **Given** the API returns a response<br>**When** the `meta.total` field is checked<br>**Then** it is a non-negative integer |
| BIDS-24 | meta.total matches the bids array length | **Given** total bids fit within one page<br>**When** `meta.total` is compared to `bids.length`<br>**Then** they are equal |
| BIDS-25 | per_page=1 returns at most 1 bid | **Given** a request is sent with `per_page=1`<br>**When** the bids array length is checked<br>**Then** at most 1 bid is returned |
| BIDS-26 | USD currency returns bids in USD | **Given** a request is sent with `currency_code=USD`<br>**When** each bid's `currency_code` is checked<br>**Then** all values equal `USD` |
| BIDS-27 | Response time is under 1 second | **Given** the bids API is available<br>**When** a GET request is sent<br>**Then** the full response is received in under 1000ms |
