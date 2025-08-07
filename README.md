# Vehicle Records Management System

A comprehensive system for managing vehicle records, procedures, and plate requests.

## Features

### Plate Request Bulk Creation

The system now supports bulk creation of plate requests with the following features:

#### Range-based Creation
- Users can specify a range of numbers (e.g., 12 to 9999)
- The system automatically generates all numbers in the range as 5-digit strings with leading zeros
- Example: Range 12-15 generates: 00012, 00013, 00014, 00015

#### Excluded Numbers
- Users can specify numbers to exclude from the range
- Supports both single numbers and ranges
- Examples:
  - Single numbers: "15, 20, 100"
  - Ranges: "100-150"
  - Mixed: "15, 20, 100-150, 200"

#### Auto-generated Bulk Names
- When creating new plate requests, a bulk name is automatically generated
- Format: `Lô_YYYYMMDD_HHMMSS` (e.g., `Lô_20241201_143052`)
- Human-readable and searchable for future reference

#### Preview Functionality
- Real-time preview shows how many numbers will be generated
- Displays total numbers in range, excluded count, and final count to be created
- Helps users understand the scope before submission

#### Backend API
- New endpoint: `POST /plate-requests/bulk`
- Handles validation, duplicate checking, and bulk creation
- Returns detailed results including created, skipped, and excluded counts

#### Frontend Integration
- Updated form with range inputs instead of single suffix number
- Preview section showing generation statistics
- Improved user experience with clear feedback

## API Endpoints

### Plate Requests
- `GET /plate-requests` - List plate requests
- `POST /plate-requests` - Create single plate request
- `POST /plate-requests/bulk` - Create bulk plate requests
- `GET /plate-requests/:id` - Get single plate request
- `PUT /plate-requests/:id` - Update plate request
- `DELETE /plate-requests/:id` - Delete plate request

## Usage Examples

### Creating Bulk Plate Requests

1. Navigate to Plate Requests page
2. Click "Create New"
3. Fill in the form:
   - **Bulk Name**: Auto-generated (e.g., `Lô_20241201_143052`)
   - **Color**: Select plate color
   - **Vehicle Type**: Select vehicle type
   - **Letter**: Select letter (A-Z)
   - **Range From**: 12
   - **Range To**: 9999
   - **Excluded Numbers**: 15, 20, 100-150
   - **Created By**: User name
   - **Updated By**: Recipient name (optional)

4. Preview section shows:
   - Total numbers in range: 9988
   - Excluded numbers: 52
   - Will create: 9936

5. Click "Tạo hàng loạt" to create all plate requests

### Response Format

```json
{
  "message": "Tạo yêu cầu dập biển số hàng loạt thành công.",
  "created": 9936,
  "skipped": 0,
  "excluded": 52,
  "items": [...],
  "skippedNumbers": [],
  "errors": null
}
```

## Technical Details

### Number Formatting
- All suffix numbers are formatted as 5-digit strings with leading zeros
- Range 1-10 generates: 00001, 00002, ..., 00010
- Range 100-105 generates: 00100, 00101, ..., 00105

### Duplicate Prevention
- System checks for existing plate requests with same bulk, letter, and suffix number
- Skips creation of duplicates and reports in response
- Maintains data integrity

### Performance
- Bulk creation is optimized for large ranges
- Uses database transactions for consistency
- Provides detailed feedback on creation results

## Development

### Backend Changes
- Added `bulkCreate` method to plate-requests controller
- Added bulk creation route
- Enhanced validation and error handling

### Frontend Changes
- Updated form schema for range inputs
- Added preview functionality
- Enhanced user interface with better feedback
- Added bulk creation service method

### Database
- No schema changes required
- Existing plate request model supports bulk creation
- Maintains backward compatibility

## Future Enhancements

- Export functionality for bulk created requests
- Batch processing for very large ranges
- Advanced filtering and search capabilities
- Integration with external systems