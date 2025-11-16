using System.ComponentModel.DataAnnotations;

public class UpdateUserEmailDto
{
    [Required, EmailAddress, StringLength(200)]
    public string NewEmail { get; set; }
}
