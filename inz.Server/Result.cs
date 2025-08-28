namespace inz.Server;

/// <summary>
/// Base result class for encapsulating responses from various sources across the app.
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error? Error { get; }

    protected Result(bool isSuccess, Error? error = null)
    {
        switch (isSuccess)
        {
            case true when error != null:
            case false when error == null:
                throw new InvalidOperationException("Error not supplied when failing");

            default:
                IsSuccess = isSuccess;
                Error = error;
                break;
        }
    }

    public static Result Success() => new(true);
    public static Result Failure(Error error) => new(false, error);
    public static Result<T> Success<T>(T value) => new(value, true, null);
    public static Result<T> Failure<T>(Error error) => new(default, false, error);
}

public class Result<T> : Result
{
    private readonly T? _value;

    public T Value
    {
        get
        {
            if (_value == null) throw new InvalidOperationException("Can't access value of failusre result");
            return _value;
        }
    }

    protected internal Result(T? value, bool isSuccess, Error? error) : base(isSuccess, error) => _value = value;

    public static implicit operator Result<T>(T value) => new(value, true, null);
}

/// <summary>
/// Base app Error class.
/// </summary>
/// <param name="Type">Type of error.</param>
/// <param name="Message">Formatted message that is often presented back to end user.</param>
/// <param name="Code">Http status code corresponding to error type.</param>
public record Error(string Type, string Message, int Code)
{
    public static readonly Error AuthenticationFailed =
        new("Auth.AUTH_FAILED", "Authentication failed", StatusCodes.Status400BadRequest);

    public static readonly Error TokenExpired =
        new("Auth.TOKEN_EXPIRED", "Token expired", StatusCodes.Status401Unauthorized);

    public static readonly Error InvalidToken =
        new("Auth.INVALID_TOKEN", "Invalid token", StatusCodes.Status401Unauthorized);

    public static readonly Error FileNotFound =
        new("File.NOT_FOUND", "File not found", StatusCodes.Status404NotFound);

    public static readonly Error FileAlreadyExists =
        new("File.ALREADY_EXISTS", "File already exists", StatusCodes.Status409Conflict);

    public static readonly Error FileIllegalExtension =
        new("File.ILLEGAL_FILE_EX", "File has illegal extension", StatusCodes.Status400BadRequest);

    public static readonly Error FileNotPresent =
        new("File.NOT_PRESENT", "File not present on server", StatusCodes.Status500InternalServerError);

    public static readonly Error PatientAlreadyExists =
        new("Patient.ALREADY_EXISTS", "Patient already exists", StatusCodes.Status409Conflict);

    public static readonly Error PatientNotFound =
        new("Patient.NOT_FOUND", "Patient not found", StatusCodes.Status404NotFound);

    public static readonly Error RoomNotFound =
        new("Room.NOT_FOUND", "Room not found", StatusCodes.Status404NotFound);

    public static readonly Error BookingNotFound =
        new("Booking.NOT_FOUND", "Booking not found", StatusCodes.Status404NotFound);

    public static readonly Error BookingAlreadyExists =
        new("Booking.ALREADY_EXISTS", "Booking already exists", StatusCodes.Status409Conflict);
    
    public static Error BookingError(string message) =>
        new("Booking.ALREADY_EXISTS", message, StatusCodes.Status409Conflict);

    public static readonly Error UserNotFound =
        new("User.USER_NOT_FOUND", "Nie znaleziono użytkownika o podanym id", StatusCodes.Status404NotFound);
}

public static class AppErrors
{
    public record UserNotFound()
        : Error("User.USER_NOT_FOUND", "Nie znaleziono użytkownika o podanym id", StatusCodes.Status404NotFound);

    public record DuplicateUserName()
        : Error("User.DUPLICATE_USERNAME", "Ta nazwa użytkownika/email jest zajęta", StatusCodes.Status409Conflict);

    public record InvalidPasswordError()
        : Error("User.INVALID_PASSWORD", "Błędne hasło", StatusCodes.Status400BadRequest);

    public record GenericError()
        : Error("User.GENERIC_ERROR", "Wystąpił nieznany błąd", StatusCodes.Status400BadRequest);

    public record FileNotFound()
        : Error("File.FILE_NOT_FOUND", "Nie znaleziono pliku o podanym id", StatusCodes.Status404NotFound);

    public record FileNotPresent()
        : Error("File.FILE_NOT_PRESENT", "Plik nie został znaleziony na dysku", StatusCodes.Status404NotFound);

    public record FileAlreadyExists()
        : Error("File.ALREADY_EXISTS", "Istnieje już plik o podanej nazwie", StatusCodes.Status409Conflict);

    public record PatientNotFound()
        : Error("Patient.PATIENT_NOT_FOUND", "Pacjent o podanym id nie istnieje", StatusCodes.Status404NotFound);

    public record PatientAlreadyExists() 
        : Error("Patient.ALREADY_EXISTS", "Pacjent o podanych danych już istnieje", StatusCodes.Status409Conflict);

    public record RoomAlreadyExists()
        : Error("Room.ALREADY_EXISTS", "Sala o podanej nazwie już isnieje", StatusCodes.Status409Conflict);
}