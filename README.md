# Infrastruktura

Infrastruktura projektu w AWS budowana Terraformem.

## Struktura

```
infrastructure/
├── main.tf            # wywołanie modułów
├── variables.tf
├── terraform.tfvars   # nazwa projektu i region
├── outputs.tf
├── providers.tf
├── versions.tf
├── backend.tf         # state w S3
└── modules/
    ├── network/       # VPC, podsieci, Internet Gateway, NAT Gateway
    ├── security/      # Security Groups
    ├── compute/       # instancje EC2 (web, app)
    └── rds/           # baza PostgreSQL (RDS)
```

## Wymagania

- [Terraform](https://developer.hashicorp.com/terraform/install) w wersji 1.10 lub nowszej
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Klucz dostępu do AWS (instrukcja niżej)
- Uprawnienia w AWS (sekcja niżej)

## Uprawnienia w AWS

Poza uprawnieniami do EC2 i VPC użytkownik IAM uruchamiający Terraform potrzebuje:

| Co | Po co |
|---|---|
| `AmazonRDSFullAccess` | tworzenie bazy RDS |
| `SecretsManagerReadWrite` | hasło do bazy w Secrets Manager |
| polityka inline `fitbook-ssm-passrole` | `iam:PassRole` dla roli `fitbook-ec2-ssm` oraz `ssm:StartSession`, `ssm:TerminateSession`, `ssm:DescribeInstanceInformation` (wejście na `ec2-app` przez Session Manager) |

Dodatkowo w koncie AWS musi istnieć rola IAM `fitbook-ec2-ssm` z polityką `AmazonSSMManagedInstanceCore`. Tworzy ją administrator raz (IAM → Roles → Create role → AWS service → EC2). Terraform tylko przypisuje ją instancji `ec2-app`.

## Klucz do AWS CLI

1. Zaloguj się do konsoli AWS na swojego użytkownika IAM.
2. Kliknij swoją nazwę w prawym górnym rogu → **Security credentials**.
3. W sekcji **Access keys** kliknij **Create access key**.
4. Wybierz **Command Line Interface (CLI)**, zaznacz potwierdzenie → **Next** → **Create access key**.
5. Skopiuj **Access key ID** i **Secret access key** (sekret widać tylko raz).
6. Skonfiguruj CLI:

```bash
aws configure
```

```
AWS Access Key ID:     <Access key ID>
AWS Secret Access Key: <Secret access key>
Default region name:   eu-central-1
Default output format: json
```

7. Sprawdź połączenie:

```bash
aws sts get-caller-identity
```

Jeśli widzisz numer konta i swojego użytkownika, wszystko działa.

## Pliki poza repozytorium

Część plików jest wykluczona w `.gitignore` i nie trafia na GitHuba:

| Plik / katalog | Co zawiera | Skąd się bierze |
|---|---|---|
| `~/.aws/credentials` | Twój klucz do AWS | tworzy go `aws configure` (poza projektem) |
| `.terraform/` | pobrany provider AWS | tworzy go `terraform init` |
| `*.tfstate` | stan infrastruktury | trzymany w S3, lokalnie nie powstaje |

Nie trzeba niczego tworzyć ręcznie poza skonfigurowaniem klucza przez `aws configure`.

## Uruchomienie

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

Tworzenie trwa około 10-15 minut (najdłużej RDS).

Usunięcie infrastruktury: `terraform destroy`

NAT Gateway i RDS są płatne za każdą godzinę działania, dlatego po testach zawsze uruchamiamy `terraform destroy`.

## Sieć

VPC: `10.0.0.0/16`

| Podsieć | Strefa a | Strefa b | Dostęp do internetu |
|---|---|---|---|
| web | 10.0.1.0/24 | 10.0.11.0/24 | tak (Internet Gateway) |
| app | 10.0.2.0/24 | 10.0.12.0/24 | tylko wychodzący (NAT Gateway) |
| db | 10.0.3.0/24 | 10.0.13.0/24 | nie |

NAT Gateway stoi w podsieci web (strefa a). Instancje w podsieci app mogą z niego korzystać do pobierania pakietów, ale z internetu nie da się do nich połączyć.

## Security Groups

| SG | Ruch przychodzący | Skąd |
|---|---|---|
| web | 80, 443, ICMP | internet |
| web | 22 (SSH) | EC2 Instance Connect |
| app | 8080, ICMP | SG web |
| db | 5432 | SG app |

## Instancje EC2

| Instancja | Podsieć | Publiczne IP |
|---|---|---|
| ec2-web | web (strefa a) | tak |
| ec2-app | app (strefa a) | nie |

Na `ec2-app` wchodzimy przez Session Manager (konsola AWS → EC2 → Connect → Session Manager).

## Baza danych (RDS)

| Parametr | Wartość |
|---|---|
| Silnik | PostgreSQL 16 |
| Klasa | db.t4g.micro |
| Podsieci | db (strefy a i b), `publicly_accessible = false` |
| Dostęp | tylko z SG app, port 5432 |
| Hasło | generowane przez AWS, zapisane w Secrets Manager |

Adres bazy i ARN sekretu z hasłem wypisują outputy `rds_endpoint` i `rds_secret_arn`. Hasło pobieramy poleceniem:

```bash
aws secretsmanager get-secret-value --secret-id <rds_secret_arn> --query SecretString --output text
```
