from setuptools import setup, find_packages

setup(
    name="jumper-protocol",
    version="1.0.0",
    description="Jumper — Next-generation wireless communication protocol (Bluetooth successor)",
    author="DARE",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.11",
    install_requires=["cryptography>=42.0.0"],
    extras_require={
        "pq":    ["liboqs-python>=0.10.0"],
        "audio": ["sounddevice>=0.4.6", "numpy>=1.26.0"],
        "dev":   ["pytest>=8.0.0", "pytest-asyncio>=0.23.0"],
    },
)
