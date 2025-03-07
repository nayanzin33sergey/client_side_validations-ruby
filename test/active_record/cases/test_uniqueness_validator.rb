# frozen_string_literal: true

require 'active_record/cases/test_base'

module ActiveRecord
  class UniquenessValidatorTest < ClientSideValidations::ActiveRecordTestBase
    def test_uniqueness_client_side_hash
      expected_hash = { message: 'has already been taken' }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name]).client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_allowing_blank
      expected_hash = { message: 'has already been taken', allow_blank: true }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], allow_blank: true).client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_allowing_nil
      expected_hash = { message: 'has already been taken', allow_blank: true }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], allow_nil: true).client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_case_insensitive
      expected_hash = { message: 'has already been taken' }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], case_sensitive: false).client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_case_sensitive
      expected_hash = { message: 'has already been taken', case_sensitive: true }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], case_sensitive: true).client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_with_custom_message
      expected_hash = { message: 'is not available' }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], message: 'is not available').client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_with_existing_record
      @user.stubs(:new_record?).returns(false)
      @user.stubs(:id).returns(1)
      expected_hash = { message: 'has already been taken', id: 1 }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name]).client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_with_single_scope_item
      @user.stubs(:age).returns(30)
      @user.stubs(:title).returns('test title')
      expected_hash = { message: 'has already been taken', scope: { title: 'test title' } }
      result_hash = UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], scope: :title).client_side_hash(@user, :name)

      assert_equal expected_hash, result_hash
    end

    def test_uniqueness_client_side_hash_with_multiple_scope_items
      @user.stubs(:age).returns(30)
      @user.stubs(:title).returns('test title')
      expected_hash = { message: 'has already been taken', scope: { age: 30, title: 'test title' } }
      result_hash = UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], scope: %i[age title]).client_side_hash(@user, :name)

      assert_equal expected_hash, result_hash
    end

    def test_uniqueness_client_side_hash_with_empty_scope_array
      expected_hash = { message: 'has already been taken' }
      result_hash = UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], scope: []).client_side_hash(@user, :name)

      assert_equal expected_hash, result_hash
    end

    def test_uniqueness_client_side_hash_when_nested_module
      @user = ActiveRecordTestModule::User2.new
      expected_hash = { message: 'has already been taken', class: 'active_record_test_module/user2' }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name]).client_side_hash(@user, :name)
    end

    def test_uniqueness_client_side_hash_with_class_from_options
      @user = UserForm.new
      expected_hash = { message: 'has already been taken', class: 'user' }

      assert_equal expected_hash, UniquenessValidator.new(class: ClientSideValidations::ActiveRecordTestBase, attributes: [:name], client_validations: { class: 'User' }).client_side_hash(@user, :name)
    end
  end
end
